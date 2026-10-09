import { Controller, Get, Patch, Post, Body, UseGuards, Req, BadRequestException } from '@nestjs/common';
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
    return this.usersService.getMyStats(req.user.userId);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getMe(@Req() req) {
    return this.usersService.findById(req.user.userId);
  }

  @Patch('me')
  @UseGuards(AuthGuard('jwt'))
  async updateProfile(@Req() req, @Body() body: any) {
    return this.usersService.update(req.user.userId, body);
  }

  @Post('me/withdraw')
  @UseGuards(AuthGuard('jwt'))
  async withdraw(@Req() req, @Body() body: { amount: number }) {
    if (!body.amount) throw new BadRequestException('Amount is required');
    return this.usersService.withdraw(req.user.userId, Number(body.amount));
  }
}
