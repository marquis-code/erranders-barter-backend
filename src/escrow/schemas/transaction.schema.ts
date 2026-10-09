import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export enum TransactionStatus { HELD_IN_ESCROW = 'held_in_escrow', RELEASED = 'released', DISPUTED = 'disputed' }

@Schema({ timestamps: true })
export class Transaction extends Document {
  @Prop({ required: true }) buyerId: string;
  @Prop({ required: true }) sellerId: string;
  @Prop({ required: true }) itemId: string;
  @Prop({ required: true }) amount: number; // total amount paid
  @Prop({ default: 0 }) itemPrice: number;
  @Prop({ default: 0 }) deliveryFee: number;
  @Prop({ default: 0 }) escrowFee: number;
  @Prop() deliveryMethod: string;
  @Prop() deliveryAddress: string;
  @Prop() erranderId: string;
  @Prop() erranderOrderId: string;
  @Prop() erranderBidId: string;
  @Prop() proposedDeliveryFee: number;
  @Prop() paymentReference: string;
  @Prop({ type: String, enum: TransactionStatus, default: TransactionStatus.HELD_IN_ESCROW }) status: TransactionStatus;
}
export const TransactionSchema = SchemaFactory.createForClass(Transaction);