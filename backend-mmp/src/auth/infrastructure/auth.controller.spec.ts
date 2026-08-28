import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { GetCurrentUserUseCase } from '../application/use-cases/get-current-user.use-case';
import { LoginUseCase } from '../application/use-cases/login.use-case';
import { RegisterUseCase } from '../application/use-cases/register.use-case';
import { UserEntity } from '../domain/user.entity';
import { AUTH_COOKIE_NAME } from './auth-cookie';
import { AuthController } from './auth.controller';

describe('AuthController', () => {
  const user = new UserEntity(
    'user-1',
    'user@example.com',
    'User',
    'hash',
    new Date('2026-01-01T00:00:00.000Z'),
    new Date('2026-01-01T00:00:00.000Z'),
  );

  const registerUseCase = {
    execute: jest.fn(),
  } as unknown as jest.Mocked<RegisterUseCase>;
  const loginUseCase = {
    execute: jest.fn(),
  } as unknown as jest.Mocked<LoginUseCase>;
  const getCurrentUserUseCase = {
    execute: jest.fn(),
  } as unknown as jest.Mocked<GetCurrentUserUseCase>;

  function buildConfigService(nodeEnv: string): ConfigService {
    return {
      get: jest.fn((key: string, defaultValue?: string) =>
        key === 'NODE_ENV' ? nodeEnv : defaultValue,
      ),
    } as unknown as ConfigService;
  }

  function buildResponse(): Response {
    return {
      cookie: jest.fn(),
      clearCookie: jest.fn(),
    } as unknown as Response;
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sets a development auth cookie on login', async () => {
    const controller = new AuthController(
      registerUseCase,
      loginUseCase,
      getCurrentUserUseCase,
      buildConfigService('development'),
    );
    const response = buildResponse();

    loginUseCase.execute.mockResolvedValue({ accessToken: 'token', user });

    const result = await controller.login(
      { email: user.email, password: 'password-123' },
      response,
    );

    expect(response.cookie).toHaveBeenCalledWith(
      AUTH_COOKIE_NAME,
      'token',
      expect.objectContaining({
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 604800000,
        path: '/',
      }),
    );
    expect(result.data.user.email).toBe(user.email);
    expect(result.data.accessToken).toBe('token');
  });

  it('sets a secure production auth cookie on register', async () => {
    const controller = new AuthController(
      registerUseCase,
      loginUseCase,
      getCurrentUserUseCase,
      buildConfigService('production'),
    );
    const response = buildResponse();

    registerUseCase.execute.mockResolvedValue({ accessToken: 'token', user });

    const result = await controller.register(
      { email: user.email, password: 'password-123', name: user.name ?? undefined },
      response,
    );

    expect(response.cookie).toHaveBeenCalledWith(
      AUTH_COOKIE_NAME,
      'token',
      expect.objectContaining({
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/',
      }),
    );
    expect(result.data.user.id).toBe(user.id);
  });

  it('returns the authenticated user on me', async () => {
    const controller = new AuthController(
      registerUseCase,
      loginUseCase,
      getCurrentUserUseCase,
      buildConfigService('development'),
    );

    getCurrentUserUseCase.execute.mockResolvedValue(user);

    const result = await controller.me({ sub: user.id, email: user.email });

    expect(getCurrentUserUseCase.execute).toHaveBeenCalledWith(user.id);
    expect(result.data.email).toBe(user.email);
  });

  it('clears the auth cookie on logout', async () => {
    const controller = new AuthController(
      registerUseCase,
      loginUseCase,
      getCurrentUserUseCase,
      buildConfigService('production'),
    );
    const response = buildResponse();

    await controller.logout(response);

    expect(response.clearCookie).toHaveBeenCalledWith(
      AUTH_COOKIE_NAME,
      expect.objectContaining({
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/',
      }),
    );
  });
});
