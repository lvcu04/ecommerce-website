import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit'; // highlight-line
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
      windowMs: 1 * 60 * 1000, // 1 phút
      max: 100, // Giới hạn mỗi IP 100 requests mỗi phút
    }),
  );

  await app.listen(process.env.PORT || 3000);
  console.log(`Server running on ${await app.getUrl()}`);
}
bootstrap();