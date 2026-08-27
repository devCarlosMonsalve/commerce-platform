export class AuthResponse {
  accessToken: string;

  static from(data: { accessToken: string }): AuthResponse {
    const dto = new AuthResponse();
    dto.accessToken = data.accessToken;
    return dto;
  }
}
