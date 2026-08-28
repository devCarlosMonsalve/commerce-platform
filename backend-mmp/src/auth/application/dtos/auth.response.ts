import { UserEntity } from '../../domain/user.entity';
import { UserResponse } from './user.response';

export class AuthResponse {
  accessToken: string;
  user: UserResponse;

  static from(data: { accessToken: string; user: UserEntity }): AuthResponse {
    const dto = new AuthResponse();
    dto.accessToken = data.accessToken;
    dto.user = UserResponse.from(data.user);
    return dto;
  }
}
