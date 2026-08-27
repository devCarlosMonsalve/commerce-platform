import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { AUTH_REPOSITORY } from './domain/auth.repository';
import { AuthController } from './infrastructure/auth.controller';
import { JwtStrategy } from './infrastructure/jwt.strategy';
import { PrismaAuthRepository } from './infrastructure/persistence/prisma-auth.repository';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'changeme'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    RegisterUseCase,
    LoginUseCase,
    JwtStrategy,
    { provide: AUTH_REPOSITORY, useClass: PrismaAuthRepository },
  ],
})
export class AuthModule {}
