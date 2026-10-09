import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Offer, OfferStatus } from './schemas/offer.schema';
import { Item } from '../items/schemas/item.schema';
import { User } from '../users/schemas/user.schema';
import { CreateOfferDto } from './dto/create-offer.dto';

@Injectable()
export class OffersService {
  constructor(
    @InjectModel(Offer.name) private offerModel: Model<Offer>,
    @InjectModel(Item.name) private itemModel: Model<Item>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async createOffer(proposerId: string, dto: CreateOfferDto): Promise<Offer> {
    if (proposerId === dto.receiverId) {
      throw new BadRequestException('Cannot make an offer to yourself');
    }

    const targetItem = await this.itemModel.findById(dto.targetItemId);
    if (!targetItem) throw new NotFoundException('Target item not found');
    if (targetItem.sellerId.toString() !== dto.receiverId) {
      throw new BadRequestException('Receiver does not own the target item');
    }
    if (targetItem.status !== 'active') {
      throw new BadRequestException('Target item is no longer available');
    }

    const offeredItem = await this.itemModel.findById(dto.offeredItemId);
    if (!offeredItem) throw new NotFoundException('Offered item not found');
    if (offeredItem.sellerId.toString() !== proposerId) {
      throw new BadRequestException('You do not own the offered item');
    }
    if (offeredItem.status !== 'active') {
      throw new BadRequestException('Your offered item is not available');
    }

    // Prevent duplicate pending offers for the same items
    const existingOffer = await this.offerModel.findOne({
      proposerId,
      targetItemId: dto.targetItemId,
      status: OfferStatus.PENDING
    });
    if (existingOffer) {
      throw new BadRequestException('You already have a pending offer for this item');
    }

    const offer = new this.offerModel({
      ...dto,
      proposerId,
      status: OfferStatus.PENDING
    });
    return offer.save();
  }

  async getMyOffers(userId: string): Promise<Offer[]> {
    return this.offerModel.find({ proposerId: userId })
      .populate('targetItemId')
      .populate('offeredItemId')
      .populate('receiverId', 'firstName lastName avatarUrl')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getReceivedOffers(userId: string): Promise<Offer[]> {
    return this.offerModel.find({ receiverId: userId })
      .populate('targetItemId')
      .populate('offeredItemId')
      .populate('proposerId', 'firstName lastName avatarUrl')
      .sort({ createdAt: -1 })
      .exec();
  }

  async updateOfferStatus(offerId: string, userId: string, status: OfferStatus): Promise<Offer> {
    const offer = await this.offerModel.findById(offerId);
    if (!offer) throw new NotFoundException('Offer not found');

    if (offer.receiverId.toString() !== userId) {
      throw new BadRequestException('Only the receiver can update the offer status');
    }

    if (offer.status !== OfferStatus.PENDING && offer.status !== OfferStatus.COUNTERED) {
      throw new BadRequestException('Offer is no longer pending');
    }

    // If accepted, check if items are still active
    if (status === OfferStatus.ACCEPTED) {
      const targetItem = await this.itemModel.findById(offer.targetItemId);
      const offeredItem = await this.itemModel.findById(offer.offeredItemId);

      if (targetItem?.status !== 'active' || offeredItem?.status !== 'active') {
        throw new BadRequestException('One or both items are no longer available for trade');
      }

      // Mark items as pending so they can't be traded again
      await this.itemModel.findByIdAndUpdate(offer.targetItemId, { status: 'pending' });
      await this.itemModel.findByIdAndUpdate(offer.offeredItemId, { status: 'pending' });

      // Automatically decline all other pending offers involving either of these items
      await this.offerModel.updateMany(
        {
          _id: { $ne: offer._id },
          status: OfferStatus.PENDING,
          $or: [
            { targetItemId: offer.targetItemId },
            { offeredItemId: offer.targetItemId },
            { targetItemId: offer.offeredItemId },
            { offeredItemId: offer.offeredItemId }
          ]
        },
        { status: OfferStatus.DECLINED }
      );
    }

    offer.status = status;
    return offer.save();
  }
}
