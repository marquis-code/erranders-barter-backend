import { Controller, Get, Param, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ChatService } from './chat.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('chats')
@UseGuards(AuthGuard('jwt'))
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  async getMyChats(@Req() req) {
    return this.chatService.getChatsForUser(req.user.userId);
  }

  @Get(':chatId/messages')
  async getMessages(@Param('chatId') chatId: string) {
    return this.chatService.getMessages(chatId);
  }

  @Post('init')
  async initChat(@Req() req, @Body() body: { participantId: string; itemId?: string }) {
    return this.chatService.findOrCreateChat([req.user.userId, body.participantId], body.itemId);
  }
}
