import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express'; // Express Request'ini import ediyoruz
import { Injectable, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// 1. Tip güvenliği için Body'nin şeklini tanımlıyoruz
interface RefreshTokenBody {
  refresh_token: string;
}

// 2. Request'in yapısını genişletiyoruz (Express Request + bizim beklediğimiz body)
interface RefreshRequest extends Request {
  body: RefreshTokenBody;
}

// 3. Payload için tip tanımı (Opsiyonel ama iyi pratik)
interface JwtPayload {
  sub: string;
  username: string;
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refresh_token'),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'secret_key',
      passReqToCallback: true,
    });
  }

  validate(req: RefreshRequest, payload: JwtPayload) {
    const refreshToken = req.body.refresh_token;

    if (!refreshToken) {
      throw new ForbiddenException('The Refresh token format is incorrect.');
    }

    return { ...payload, refreshToken };
  }
}
