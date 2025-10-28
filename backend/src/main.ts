// backend/src/main.ts
// ... imports
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // Thêm tùy chọn này để NestJS không tự parse body cho route webhook
    bodyParser: false,
  });

  // Middleware để parse JSON cho các route khác
  app.use(bodyParser.json({
    verify: (req: any, res, buf) => { // Lưu rawBody cho webhook
      req.rawBody = buf;
    }
  }));
  // Middleware để parse URL encoded body nếu cần
  app.use(bodyParser.urlencoded({ extended: true, verify: (req: any, res, buf) => { req.rawBody = buf; } }));


  // ... phần còn lại của bootstrap ...

  await app.listen(process.env.PORT || 3001); // Sửa port nếu cần
  console.log(`Server running on ${await app.getUrl()}`);
}
bootstrap();