// backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { CartModule } from './cart/cart.module';
import { OrdersModule } from './orders/orders.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { UploadModule } from './upload/upload.module';
import { ReviewsModule } from './reviews/reviews.module';
import { AdminModule } from './admin/admin.module';
import { PaymentsModule } from './payments/payments.module';

// 👇 1. Import CategoriesModule
import { CategoriesModule } from './categories/categories.module'; 

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UsersModule,
    AuthModule,
    ProductsModule,
    CartModule,
    OrdersModule,
    CloudinaryModule,
    UploadModule,
    ReviewsModule,
    AdminModule,
    PaymentsModule,
    CategoriesModule, // 👈 2. Thêm CategoriesModule vào đây
  ],
  providers: [PrismaService],
})
export class AppModule {}