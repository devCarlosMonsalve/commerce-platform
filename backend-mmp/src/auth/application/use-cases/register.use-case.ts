import { ConflictException, Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AUTH_REPOSITORY } from '../../domain/auth.repository';
import type { IAuthRepository } from '../../domain/auth.repository';
import { UserEntity } from '../../domain/user.entity';
import { RegisterDto } from '../dtos/register.dto';

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY) private readonly authRepository: IAuthRepository,
  ) {}

  async execute(dto: RegisterDto): Promise<UserEntity> {
    const existing = await this.authRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    return this.authRepository.create({
      email: dto.email,
      name: dto.name,
      passwordHash,
    });
  }
}
