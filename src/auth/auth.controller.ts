import { Controller, Post, Body, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Register a new user' })
  async signup(@Body() body: { firstName: string; lastName: string; email: string; password: string; whatsappNumber: string; university: string; hostel: string; level: string }) {
    return this.authService.signup(body);
  }

  @Post('login')
  @ApiOperation({ summary: 'Log in with email and password' })
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body);
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request a password reset email' })
  async forgotPassword(@Body() body: { email: string }) {
    return this.authService.forgotPassword(body.email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password using token' })
  async resetPassword(@Body() body: { token: string; password: string }) {
    return this.authService.resetPassword(body);
  }

  @Post('firebase-login')
  @ApiOperation({ summary: 'Login via Firebase ID Token' })
  async firebaseLogin(@Body() body: { idToken: string; isSignUp?: boolean }) {
    return this.authService.firebaseLogin(body.idToken);
  }
}
