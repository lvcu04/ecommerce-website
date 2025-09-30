import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async createOrderFromCart(userId: number, address: string) {
    const cartItems = await this.prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });

    if (cartItems.length === 0) throw new Error('Cart is empty');

    const total = cartItems.reduce((s, it) => s + it.quantity * it.product.price, 0);

    const order = await this.prisma.order.create({
      data: {
        userId,
        totalPrice: total,
        status: 'pending',
        orderItems: {
          create: cartItems.map((it) => ({
            productId: it.productId,
            quantity: it.quantity,
            price: it.product.price,
          })),
        },
      },
      include: { orderItems: true },
    });

    // giảm stock (đơn giản, cần transaction/lock nếu production)
    for (const it of cartItems) {
      await this.prisma.product.update({
        where: { id: it.productId },
        data: { stock: { decrement: it.quantity } as any },
      });
    }

    // xóa cart items
    await this.prisma.cartItem.deleteMany({ where: { userId } });

    return order;
  }

  findByUser(userId: number) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { orderItems: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
