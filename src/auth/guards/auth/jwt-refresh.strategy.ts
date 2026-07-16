import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Injectable, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface RefreshTokenBody {
  refresh_token: string;
}

interface RefreshRequest extends Request {
  body: RefreshTokenBody;
}

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
