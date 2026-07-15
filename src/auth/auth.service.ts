import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login(username: string, pass: string) {
    const user = await this.userService.findOneByUsername(username);
    if (!user) throw new UnauthorizedException('Invalid username');

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid password');

    const payload = { sub: user.id, username: user.username };
    const tokens = await this.getTokens(payload);

    await this.updateRefreshTokenHash(user.id, tokens.refresh_token);

    return tokens;
  }

  async logout(userId: string) {
    await this.userService.updateRefreshToken(userId, null);
  }

  async logoutAll(userId: string) {
    await this.userService.updateRefreshToken(userId, null);
  }

  async refresh(userId: string, refreshToken: string) {
    const user = await this.userService.findById(userId);
    if (!user || !user.refreshToken) {
      throw new ForbiddenException('Access denied. Please log in again.');
    }

    const isRefreshTokenMatch = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );
    if (!isRefreshTokenMatch) {
      throw new ForbiddenException('Invalid or expired refresh token.');
    }

    const payload = { sub: user.id, username: user.username };

    const tokens = await this.getTokens(payload);
    await this.updateRefreshTokenHash(user.id, tokens.refresh_token);

    return tokens;
  }

  private async updateRefreshTokenHash(userId: string, refreshToken: string) {
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.userService.updateRefreshToken(userId, hash);
  }

  private async getTokens(payload: { sub: string; username: string }) {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(payload, { expiresIn: '15m' }),
      this.jwtService.signAsync(payload, { expiresIn: '7d' }),
    ]);

    return {
      access_token: at,
      refresh_token: rt,
    };
  }
}
