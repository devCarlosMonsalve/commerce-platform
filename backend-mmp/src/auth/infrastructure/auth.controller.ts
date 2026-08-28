import { Body, Controller, Get, HttpCode, HttpStatus, Post, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { LoginDto } from '../application/dtos/login.dto';
import { RegisterDto } from '../application/dtos/register.dto';
import { AuthResponse } from '../application/dtos/auth.response';
import { UserResponse } from '../application/dtos/user.response';
import { GetCurrentUserUseCase } from '../application/use-cases/get-current-user.use-case';
import { LoginUseCase } from '../application/use-cases/login.use-case';
import { RegisterUseCase } from '../application/use-cases/register.use-case';
import { CurrentUser } from '../../shared/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { ok } from '../../shared/response/api-response';
import type { JwtPayload } from '../../shared/types/jwt-payload';
import { AUTH_COOKIE_NAME, buildAuthCookieOptions, buildClearAuthCookieOptions } from './auth-cookie';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly getCurrentUserUseCase: GetCurrentUserUseCase,
    private readonly configService: ConfigService,
  ) {}

  private isProduction(): boolean {
    return this.configService.get<string>('NODE_ENV') === 'production';
  }

  private setAuthCookie(response: Response, accessToken: string): void {
    response.cookie(
      AUTH_COOKIE_NAME,
      accessToken,
      buildAuthCookieOptions(this.isProduction()),
    );
  }

  private clearAuthCookie(response: Response): void {
    response.clearCookie(
      AUTH_COOKIE_NAME,
      buildClearAuthCookieOptions(this.isProduction()),
    );
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.registerUseCase.execute(dto);
    this.setAuthCookie(response, result.accessToken);
    return ok(AuthResponse.from(result), 'User registered successfully');
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) response: Response) {
    const result = await this.loginUseCase.execute(dto);
    this.setAuthCookie(response, result.accessToken);
    return ok(AuthResponse.from(result));
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: JwtPayload) {
    const currentUser = await this.getCurrentUserUseCase.execute(user.sub);
    return ok(UserResponse.from(currentUser));
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) response: Response) {
    this.clearAuthCookie(response);
    return ok(null, 'Logged out successfully');
  }
}
