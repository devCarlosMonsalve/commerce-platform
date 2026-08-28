import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';
import { AUTH_COOKIE_NAME } from './auth-cookie';

interface JwtPayload {
  sub: string;
  email: string;
}

function extractJwtFromCookie(request: Request): string | null {
  return request.cookies?.[AUTH_COOKIE_NAME] ?? null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        extractJwtFromCookie,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET', 'changeme'),
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    return payload;
  }
}
