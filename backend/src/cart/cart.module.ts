import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';

@Module({
  providers: [CartService, PrismaService],
  controllers: [CartController],
})
export class CartModule {}
