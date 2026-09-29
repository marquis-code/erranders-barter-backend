import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ select: false })
  password: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop()
  googleId: string;

  @Prop()
  avatar: string;

  @Prop()
  hostel: string;

  @Prop()
  level: string;

  @Prop({ default: 0 })
  rating: number;

  @Prop({ default: 0 })
  totalTrades: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
