// backend/src/admin/admin.module.ts
import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { ProductsModule } from '../products/products.module'; 
import { OrdersModule } from '../orders/orders.module';   
import { PrismaService } from '../prisma.service';
import { ProductsController } from './products.controller';
import { DashboardController } from './dashboard.controller'; 

@Module({
  imports: [ProductsModule, OrdersModule],
  controllers: [
    OrdersController, 
    ProductsController, 
    DashboardController 
  ],
  providers: [PrismaService],
})
export class AdminModule {}