import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { IAuthRepository } from '../../domain/auth.repository';
import { UserEntity } from '../../domain/user.entity';

@Injectable()
export class PrismaAuthRepository implements IAuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return null;
    }

    return new UserEntity(
      user.id,
      user.email,
      user.name,
      user.passwordHash,
      user.createdAt,
      user.updatedAt,
    );
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      return null;
    }

    return new UserEntity(
      user.id,
      user.email,
      user.name,
      user.passwordHash,
      user.createdAt,
      user.updatedAt,
    );
  }

  async create(data: {
    email: string;
    name?: string;
    passwordHash: string;
  }): Promise<UserEntity> {
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash: data.passwordHash,
      },
    });

    return new UserEntity(
      user.id,
      user.email,
      user.name,
      user.passwordHash,
      user.createdAt,
      user.updatedAt,
    );
  }
}
