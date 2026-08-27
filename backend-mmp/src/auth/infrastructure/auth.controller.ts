import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { LoginDto } from '../application/dtos/login.dto';
import { RegisterDto } from '../application/dtos/register.dto';
import { AuthResponse } from '../application/dtos/auth.response';
import { UserResponse } from '../application/dtos/user.response';
import { LoginUseCase } from '../application/use-cases/login.use-case';
import { RegisterUseCase } from '../application/use-cases/register.use-case';
import { ok } from '../../shared/response/api-response';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const user = await this.registerUseCase.execute(dto);
    return ok(UserResponse.from(user), 'User registered successfully');
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    const result = await this.loginUseCase.execute(dto);
    return ok(AuthResponse.from(result));
  }
}

