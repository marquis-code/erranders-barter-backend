import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Chat, ChatDocument } from './schemas/chat.schema';
import { Message, MessageDocument } from './schemas/message.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Chat.name) private chatModel: Model<ChatDocument>,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>
  ) {}

  async findOrCreateChat(participantIds: string[], itemId?: string) {
    // Check if chat exists
    const query: any = { participants: { $all: participantIds, $size: participantIds.length } };
    if (itemId) query.item = itemId;
    
    let chat = await this.chatModel.findOne(query).exec();
    if (!chat) {
      chat = await new this.chatModel({
        participants: participantIds,
        item: itemId
      }).save();
    }
    return chat;
  }

  async getChatsForUser(userId: string) {
    return this.chatModel.find({ participants: userId })
      .populate('participants', 'firstName lastName email')
      .populate('lastMessage')
      .sort({ updatedAt: -1 })
      .exec();
  }

  async getMessages(chatId: string) {
    return this.messageModel.find({ chatId })
      .populate('sender', 'firstName lastName email')
      .populate('replyTo')
      .sort({ createdAt: 1 })
      .exec();
  }

  async saveMessage(chatId: string, senderId: string, content: string, type: string = 'text', assetUrl: string = '', replyTo?: string) {
    const msg = await new this.messageModel({
      chatId,
      sender: senderId,
      content,
      type,
      assetUrl,
      replyTo
    }).save();

    await this.chatModel.findByIdAndUpdate(chatId, {
      lastMessage: msg._id,
      updatedAt: new Date()
    });

    return msg.populate('sender', 'firstName lastName email');
  }
}
