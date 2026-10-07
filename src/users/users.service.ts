import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import { Item, ItemStatus } from '../items/schemas/item.schema';
import { Transaction, TransactionStatus } from '../escrow/schemas/transaction.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Item.name) private itemModel: Model<Item>,
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).select('+password').exec();
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async create(data: Partial<User>): Promise<User> {
    return new this.userModel(data).save();
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    return this.userModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  async getMyStats(userId: string) {
    const activeListings = await this.itemModel.countDocuments({
      sellerId: userId,
      status: ItemStatus.ACTIVE,
    });

    const completedTrades = await this.transactionModel.countDocuments({
      $or: [{ buyerId: userId }, { sellerId: userId }],
      status: TransactionStatus.RELEASED,
    });

    const escrowTransactions = await this.transactionModel.find({
      sellerId: userId,
      status: TransactionStatus.HELD_IN_ESCROW,
    });

    const escrowBalance = escrowTransactions.reduce((acc, curr) => acc + (curr.amount || 0), 0);

    const user = await this.userModel.findById(userId);
    // Dummy seller rating calculation for now
    const sellerRating = user && (user as any).sellerRating ? (user as any).sellerRating : 4.8;

    return {
      activeListings,
      completedTrades,
      escrowBalance,
      sellerRating,
    };
  }

  async findOrCreateGoogle(profile: any): Promise<User> {
    let user = await this.userModel.findOne({ googleId: profile.id }).exec();
    if (!user) {
      user = await this.userModel.findOne({ email: profile.emails[0].value }).exec();
      if (user) {
        user.googleId = profile.id;
        user.avatar = profile.photos?.[0]?.value;
        await user.save();
      } else {
        user = await new this.userModel({
          googleId: profile.id,
          email: profile.emails[0].value,
          firstName: profile.name?.givenName || 'User',
          lastName: profile.name?.familyName || '',
          avatar: profile.photos?.[0]?.value,
          isVerified: true,
        }).save();
      }
    }
    return user;
  }
}
