import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // highlight-line
import { PrismaService } from './prisma.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module'; // Sửa lại import này
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    // highlight-start
    ConfigModule.forRoot({
      isGlobal: true, // Biến môi trường sẽ có sẵn trên toàn ứng dụng
    }),
    // highlight-end
    UsersModule,
    AuthModule,
    ProductsModule,
    CartModule,
    OrdersModule,
    CloudinaryModule,
    UploadModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}