import { Controller, Get, Patch, Body, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('admin/all')
  async getAllUsers() {
    return this.usersService.findAll();
  }

  @Get('me/stats')
  @UseGuards(AuthGuard('jwt'))
  async getMyStats(@Req() req) {
    return {
      activeListings: 4, 
      completedTrades: 12, 
      escrowBalance: 45000,
      sellerRating: 4.8
    };
  }

  @Patch('me')
  @UseGuards(AuthGuard('jwt'))
  async updateProfile(@Req() req, @Body() body: any) {
    return this.usersService.update(req.user.userId, body);
  }
}
