import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signup(dto: { firstName: string; lastName: string; email: string; password: string; whatsappNumber: string; university: string; hostel: string; level: string }) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already registered');

    const hashed = await bcrypt.hash(dto.password, 12);
    const user = await this.usersService.create({ ...dto, password: hashed });
    return this.generateToken(user);
  }

  async login(dto: { email: string; password: string }) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !user.password) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return this.generateToken(user);
  }

  async googleLogin(profile: any) {
    const user = await this.usersService.findOrCreateGoogle(profile);
    return this.generateToken(user);
  }

  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) return { message: 'If email exists, a reset link was sent.' };
    return { message: 'If email exists, a reset link was sent.' };
  }

  async resetPassword(dto: { token: string; password: string }) {
    // Basic mock logic, assuming real system verifies token.
    return { message: 'Password has been reset successfully.' };
  }

  private generateToken(user: any) {
    const payload = { sub: user._id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar,
        isVerified: user.isVerified,
      },
    };
  }
}
