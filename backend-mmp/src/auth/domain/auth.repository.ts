import { UserEntity } from './user.entity';

export const AUTH_REPOSITORY = 'AUTH_REPOSITORY';

export interface IAuthRepository {
  findByEmail(email: string): Promise<UserEntity | null>;
  findById(id: string): Promise<UserEntity | null>;
  create(data: {
    email: string;
    name?: string;
    passwordHash: string;
  }): Promise<UserEntity>;
}
