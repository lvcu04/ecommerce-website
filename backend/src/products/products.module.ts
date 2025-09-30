import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';

@Module({
  providers: [ProductsService, PrismaService],
  controllers: [ProductsController],
  exports: [ProductsService],
})
export class ProductsModule {}
