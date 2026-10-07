import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: { origin: '*' }
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async handleConnection(socket: Socket) {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers['authorization'];
      if (!token) return socket.disconnect();
      
      const payload = this.jwtService.verify(token.replace('Bearer ', ''), {
        secret: this.configService.get<string>('JWT_SECRET') || 'dev-secret-key'
      });
      socket.data.userId = payload.sub;
      socket.join(payload.sub); // Join a personal room for direct user notifications
    } catch (err) {
      socket.disconnect();
    }
  }

  handleDisconnect(socket: Socket) {}

  @SubscribeMessage('joinChat')
  handleJoinChat(@MessageBody() data: { chatId: string }, @ConnectedSocket() socket: Socket) {
    socket.join(data.chatId);
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() data: { chatId: string; content: string; type?: string; assetUrl?: string; replyTo?: string },
    @ConnectedSocket() socket: Socket
  ) {
    const userId = socket.data.userId;
    if (!userId) return;

    const message = await this.chatService.saveMessage(
      data.chatId,
      userId,
      data.content,
      data.type,
      data.assetUrl,
      data.replyTo
    );

    // Broadcast to everyone in the chat
    this.server.to(data.chatId).emit('newMessage', message);
  }
}
