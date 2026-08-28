import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { AUTH_REPOSITORY } from '../../domain/auth.repository';
import type { IAuthRepository } from '../../domain/auth.repository';
import { UserEntity } from '../../domain/user.entity';

@Injectable()
export class GetCurrentUserUseCase {
  constructor(
    @Inject(AUTH_REPOSITORY) private readonly authRepository: IAuthRepository,
  ) {}

  async execute(userId: string): Promise<UserEntity> {
    const user = await this.authRepository.findById(userId);

    if (!user) {
      throw new UnauthorizedException('Invalid session');
    }

    return user;
  }
}
