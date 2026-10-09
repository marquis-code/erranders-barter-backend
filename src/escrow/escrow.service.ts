import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction, TransactionStatus } from './schemas/transaction.schema';
import { SettingsService } from '../settings/settings.service';
import { UsersService } from '../users/users.service';
import { Item } from '../items/schemas/item.schema';

@Injectable()
export class EscrowService {
  constructor(
    @InjectModel(Transaction.name) private txModel: Model<Transaction>,
    @InjectModel(Item.name) private itemModel: Model<Item>,
    private settingsService: SettingsService,
    private usersService: UsersService,
  ) {}

  async initiate(dto: { buyerId: string; sellerId: string; itemId: string; amount: number; deliveryMethod?: string; deliveryAddress?: string; paymentReference?: string; deliveryFee?: number }): Promise<Transaction> {
    const item = await this.itemModel.findById(dto.itemId);
    if (!item) throw new NotFoundException('Item not found');

    let deliveryFee = 0;
    if (dto.deliveryMethod === 'errander') {
      deliveryFee = dto.deliveryFee || 500;
    }

    const escrowFeePercVal = await this.settingsService.getSetting('escrow_fee_percentage');
    const escrowFeePerc = escrowFeePercVal ? Number(escrowFeePercVal) : 0;
    
    // We know itemPrice.
    const itemPrice = item.price;
    // Calculate escrow fee based on itemPrice + deliveryFee
    const baseTotal = itemPrice + deliveryFee;
    const escrowFee = (baseTotal * escrowFeePerc) / 100;
    
    // Create tx
    const tx = new this.txModel({ 
      ...dto,
      itemPrice,
      deliveryFee,
      escrowFee,
      status: TransactionStatus.HELD_IN_ESCROW 
    });
    const savedTx = await tx.save();

    // Call Erranders Webhook if errander delivery is selected
    if (dto.deliveryMethod === 'errander') {
      try {
        const seller = await this.usersService.findById(dto.sellerId);
        const buyer = await this.usersService.findById(dto.buyerId);
        const apiUrl = process.env.ERRANDERS_API_URL || 'https://api.erranders.org/api/v1';
        const apiKey = process.env.BARTER_API_KEY || 'barter_secret_123';
        
        fetch(`${apiUrl}/orders/webhook/barter`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
          },
          body: JSON.stringify({
            pickupLocation: seller?.hostel || 'Seller Location',
            dropoffLocation: dto.deliveryAddress || buyer?.hostel || 'Buyer Location',
            fee: deliveryFee,
            description: `Barter Delivery: ${item.title}`,
            barterTransactionId: savedTx._id.toString()
          })
        }).catch(err => console.error('Failed to dispatch webhook to erranders:', err));
      } catch (err) {
        console.error('Error preparing webhook payload:', err);
      }
    }

    return savedTx;
  }

  async release(txId: string, buyerId: string): Promise<Transaction> {
    const tx = await this.txModel.findById(txId);
    if (!tx) throw new NotFoundException('Transaction not found');
    if (tx.buyerId !== buyerId) throw new BadRequestException('Only the buyer can release funds');
    if (tx.status !== TransactionStatus.HELD_IN_ESCROW) throw new BadRequestException('Funds already released or disputed');

    // Commission settings
    const sellerCommVal = await this.settingsService.getSetting('seller_commission_percentage');
    const sellerCommPerc = sellerCommVal ? Number(sellerCommVal) : 0;

    // Calculate payouts
    const sellerPayout = tx.itemPrice - ((tx.itemPrice * sellerCommPerc) / 100);

    // Update seller wallet
    await this.usersService.incrementWalletBalance(tx.sellerId, sellerPayout);

    // If there's an Errander, we would credit their wallet. Currently, Barter doesn't have an errander assignment flow, 
    // but the Errander's payout would be: tx.deliveryFee - ((tx.deliveryFee * erranderCommPerc) / 100).

    tx.status = TransactionStatus.RELEASED;
    return tx.save();
  }

  async dispute(txId: string, userId: string): Promise<Transaction> {
    const tx = await this.txModel.findById(txId);
    if (!tx) throw new NotFoundException('Transaction not found');
    if (tx.buyerId !== userId && tx.sellerId !== userId) throw new BadRequestException('Not a party to this transaction');

    tx.status = TransactionStatus.DISPUTED;
    const savedTx = await tx.save();

    if (tx.erranderOrderId) {
      const apiUrl = process.env.ERRANDERS_API_URL || 'http://localhost:3005/api/v1';
      const apiKey = process.env.BARTER_API_KEY || 'btr_sk_live_placeholder';

      try {
        await fetch(`${apiUrl}/orders/webhook/dispute`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
          },
          body: JSON.stringify({
            orderId: tx.erranderOrderId
          })
        });
      } catch (e) {
        console.error('Failed to send dispute webhook to Erranders', e);
      }
    }

    return savedTx;
  }

  async findByUser(userId: string): Promise<Transaction[]> {
    return this.txModel.find({ $or: [{ buyerId: userId }, { sellerId: userId }] }).sort({ createdAt: -1 }).exec();
  }

  async findAll(): Promise<Transaction[]> {
    return this.txModel.find().sort({ createdAt: -1 }).exec();
  }

  async handleNegotiationWebhook(payload: { barterTransactionId: string; orderId: string; bidId: string; proposedFee: number }) {
    const tx = await this.txModel.findById(payload.barterTransactionId);
    if (!tx) throw new NotFoundException('Transaction not found');
    
    tx.erranderOrderId = payload.orderId;
    tx.erranderBidId = payload.bidId;
    tx.proposedDeliveryFee = payload.proposedFee;
    
    return tx.save();
  }

  async handleAcceptWebhook(payload: { barterTransactionId: string; orderId: string; bidId: string; finalFee: number }) {
    const tx = await this.txModel.findById(payload.barterTransactionId);
    if (!tx) throw new NotFoundException('Transaction not found');
    
    tx.deliveryFee = payload.finalFee;
    tx.proposedDeliveryFee = 0;
    
    return tx.save();
  }

  async acceptNegotiation(txId: string, buyerId: string) {
    const tx = await this.txModel.findById(txId);
    if (!tx) throw new NotFoundException('Transaction not found');
    if (tx.buyerId !== buyerId) throw new BadRequestException('Only the buyer can accept negotiations');
    if (!tx.erranderBidId) throw new BadRequestException('No negotiation exists for this transaction');

    const apiUrl = process.env.ERRANDERS_API_URL || 'https://api.erranders.org/api/v1';
    const apiKey = process.env.BARTER_API_KEY || 'barter_secret_123';

    try {
      // Call Erranders backend to accept the bid
      const response = await fetch(`${apiUrl}/orders/webhook/negotiation/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({
          orderId: tx.erranderOrderId,
          bidId: tx.erranderBidId
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to accept negotiation on Erranders backend');
      }

      tx.deliveryFee = tx.proposedDeliveryFee;
      tx.proposedDeliveryFee = 0; // clear it
      tx.erranderBidId = null; // clear it
      return tx.save();
    } catch (err) {
      console.error(err);
      throw new BadRequestException('Could not accept negotiation');
    }
  }

  async counterNegotiation(txId: string, buyerId: string, amount: number) {
    const tx = await this.txModel.findById(txId);
    if (!tx) throw new NotFoundException('Transaction not found');
    if (tx.buyerId !== buyerId) throw new BadRequestException('Only the buyer can negotiate');
    if (!tx.erranderBidId) throw new BadRequestException('No negotiation exists for this transaction');

    const apiUrl = process.env.ERRANDERS_API_URL || 'http://localhost:3005/api/v1';
    const apiKey = process.env.BARTER_API_KEY || 'btr_sk_live_placeholder';

    try {
      const response = await fetch(`${apiUrl}/orders/webhook/negotiation/counter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({
          orderId: tx.erranderOrderId,
          bidId: tx.erranderBidId,
          counterAmount: amount
        })
      });
      
      if (!response.ok) {
        const text = await response.text();
        throw new Error('Failed to counter negotiation on Erranders backend: ' + text);
      }

      tx.proposedDeliveryFee = amount;
      return tx.save();
    } catch (err) {
      console.error(err);
      throw new BadRequestException('Could not counter negotiation');
    }
  }
}