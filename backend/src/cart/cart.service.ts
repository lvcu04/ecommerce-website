import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async addToCart(userId: number, productId: number, quantity = 1) {
    const existing = await this.prisma.cartItem.findFirst({
      where: { userId, productId },
    });

    if (existing) {
      return this.prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      });
    }
    return this.prisma.cartItem.create({
      data: { userId, productId, quantity },
    });
  }

  getCart(userId: number) {
    return this.prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });
  }

  async removeItem(id: number) {
    return this.prisma.cartItem.delete({ where: { id } });
  }

  async clearCart(userId: number) {
    return this.prisma.cartItem.deleteMany({ where: { userId } });
  }
}
