import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum TransactionStatus { HELD_IN_ESCROW = 'held_in_escrow', RELEASED = 'released', DISPUTED = 'disputed' }

@Schema({ timestamps: true })
export class Transaction extends Document {
  @Prop({ required: true }) buyerId: string;
  @Prop({ required: true }) sellerId: string;
  @Prop({ required: true }) itemId: string;
  @Prop({ required: true }) amount: number;
  @Prop({ type: String, enum: TransactionStatus, default: TransactionStatus.HELD_IN_ESCROW }) status: TransactionStatus;
}
export const TransactionSchema = SchemaFactory.createForClass(Transaction);