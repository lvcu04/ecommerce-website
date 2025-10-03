import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async createOrderFromCart(userId: number, address: string) {
    const cartItems = await this.prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      throw new NotFoundException('Cart is empty');
    }

    const total = cartItems.reduce((s, it) => s + it.quantity * it.product.price, 0);

    // highlight-start
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId,
          totalPrice: total,
          status: 'pending', // Bạn có thể thêm address vào đây nếu đã thêm cột address vào model Order
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

      // Giảm stock sản phẩm
      for (const it of cartItems) {
        await tx.product.update({
          where: { id: it.productId },
          data: { stock: { decrement: it.quantity } },
        });
      }

      // Xóa các sản phẩm trong giỏ hàng
      await tx.cartItem.deleteMany({ where: { userId } });

      return order;
    });
    // highlight-end
  }

  findByUser(userId: number) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { orderItems: { include: { product: true } } }, // Lấy thêm thông tin sản phẩm
      orderBy: { createdAt: 'desc' },
    });
  }
}