import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';

@Module({
  providers: [OrdersService, PrismaService],
  controllers: [OrdersController],
  exports: [OrdersService]
})
export class OrdersModule {}
