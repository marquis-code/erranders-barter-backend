import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction, TransactionStatus } from './schemas/transaction.schema';

@Injectable()
export class EscrowService {
  constructor(@InjectModel(Transaction.name) private txModel: Model<Transaction>) {}

  async initiate(dto: { buyerId: string; sellerId: string; itemId: string; amount: number }): Promise<Transaction> {
    const tx = new this.txModel({ ...dto, status: TransactionStatus.HELD_IN_ESCROW });
    return tx.save();
  }

  async release(txId: string, buyerId: string): Promise<Transaction> {
    const tx = await this.txModel.findById(txId);
    if (!tx) throw new NotFoundException('Transaction not found');
    if (tx.buyerId !== buyerId) throw new BadRequestException('Only the buyer can release funds');
    if (tx.status !== TransactionStatus.HELD_IN_ESCROW) throw new BadRequestException('Funds already released or disputed');

    tx.status = TransactionStatus.RELEASED;
    return tx.save();
  }

  async dispute(txId: string, userId: string): Promise<Transaction> {
    const tx = await this.txModel.findById(txId);
    if (!tx) throw new NotFoundException('Transaction not found');
    if (tx.buyerId !== userId && tx.sellerId !== userId) throw new BadRequestException('Not a party to this transaction');

    tx.status = TransactionStatus.DISPUTED;
    return tx.save();
  }

  async findByUser(userId: string): Promise<Transaction[]> {
    return this.txModel.find({ $or: [{ buyerId: userId }, { sellerId: userId }] }).sort({ createdAt: -1 }).exec();
  }

  async findAll(): Promise<Transaction[]> {
    return this.txModel.find().sort({ createdAt: -1 }).exec();
  }
}