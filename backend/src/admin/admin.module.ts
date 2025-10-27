import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { ProductsModule } from '../products/products.module'; 
import { OrdersModule } from '../orders/orders.module';   
import { PrismaService } from '../prisma.service';
import { ProductsController } from './products.controller';

@Module({
  imports: [ProductsModule, OrdersModule],
  controllers: [OrdersController, ProductsController],
  providers: [PrismaService],
})
export class AdminModule {}