import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import * as rateLimit from 'express-rate-limit';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.use(
    rateLimit({
      windowMs: 1 * 60 * 1000,
      max: 100,
    }),
  );

  await app.listen(process.env.PORT || 3000);
  console.log(`Server running on ${await app.getUrl()}`);
}
bootstrap();
