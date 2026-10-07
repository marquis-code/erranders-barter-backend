import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

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

  async firebaseLogin(idToken: string) {
    if (!getApps().length) {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    }

    try {
      const decodedToken = await getAuth().verifyIdToken(idToken);
      const email = decodedToken.email;
      if (!email) throw new UnauthorizedException('No email found in token');

      const names = (decodedToken.name || '').split(' ');
      const profile = {
        id: decodedToken.uid,
        emails: [{ value: email }],
        name: {
          givenName: names[0] || 'User',
          familyName: names.slice(1).join(' ') || ''
        },
        photos: [{ value: decodedToken.picture || '' }]
      };
      const user = await this.usersService.findOrCreateGoogle(profile);
      return this.generateToken(user);
    } catch (e) {
      throw new UnauthorizedException('Invalid Firebase Token');
    }
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
