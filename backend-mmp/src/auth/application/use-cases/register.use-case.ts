import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AUTH_REPOSITORY } from '../../domain/auth.repository';
import type { IAuthRepository } from '../../domain/auth.repository';
import { UserEntity } from '../../domain/user.entity';
import { RegisterDto } from '../dtos/register.dto';

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY) private readonly authRepository: IAuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  async execute(dto: RegisterDto): Promise<{ accessToken: string; user: UserEntity }> {
    const existing = await this.authRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.authRepository.create({
      email: dto.email,
      name: dto.name,
      passwordHash,
    });

    const payload = { sub: user.id, email: user.email };

    return {
      accessToken: this.jwtService.sign(payload),
      user,
    };
  }
}
