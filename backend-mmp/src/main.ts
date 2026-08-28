import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';
import { LoggingInterceptor } from './shared/interceptors/logging.interceptor';

function resolveCorsOrigin(): string | string[] {
  const configuredOrigins =
    process.env.CORS_ORIGIN?.split(',')
      .map((origin) => origin.trim())
      .filter((origin) => origin.length > 0) ?? [];

  if (configuredOrigins.length === 0) {
    return 'http://localhost:3000';
  }

  return configuredOrigins.length === 1 ? configuredOrigins[0] : configuredOrigins;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.use(cookieParser());
  app.enableCors({
    origin: resolveCorsOrigin(),
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new LoggingInterceptor());

  app.setGlobalPrefix('api');
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
