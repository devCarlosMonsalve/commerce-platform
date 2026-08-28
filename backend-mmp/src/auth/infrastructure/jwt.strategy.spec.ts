import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  function buildConfigService(): ConfigService {
    return {
      get: jest.fn((key: string, defaultValue?: string) =>
        key === 'JWT_SECRET' ? 'test-secret' : defaultValue,
      ),
    } as unknown as ConfigService;
  }

  it('extracts the token from the auth cookie first', () => {
    const strategy = new JwtStrategy(buildConfigService());
    const extractor = (
      strategy as unknown as { _jwtFromRequest: (request: unknown) => string | null }
    )._jwtFromRequest;

    const token = extractor({
      cookies: { access_token: 'cookie-token' },
      headers: { authorization: 'Bearer header-token' },
    });

    expect(token).toBe('cookie-token');
  });

  it('falls back to the bearer token when no cookie exists', () => {
    const strategy = new JwtStrategy(buildConfigService());
    const extractor = (
      strategy as unknown as { _jwtFromRequest: (request: unknown) => string | null }
    )._jwtFromRequest;

    const token = extractor({
      headers: { authorization: 'Bearer header-token' },
    });

    expect(token).toBe('header-token');
  });
});
