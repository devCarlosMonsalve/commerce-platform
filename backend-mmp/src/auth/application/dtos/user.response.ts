import { UserEntity } from '../../domain/user.entity';

export class UserResponse {
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;

  static from(entity: UserEntity): UserResponse {
    const dto = new UserResponse();
    dto.id = entity.id;
    dto.email = entity.email;
    dto.name = entity.name;
    dto.createdAt = entity.createdAt;
    return dto;
  }
}
