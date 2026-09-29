import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

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
