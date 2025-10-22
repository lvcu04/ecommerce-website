import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Tạo một đơn hàng từ tất cả các sản phẩm trong giỏ hàng của người dùng.
   * @param userId ID của người dùng
   * @param address Địa chỉ giao hàng
   * @returns Đơn hàng đã được tạo
   */
  async createOrderFromCart(userId: number, address: string) {
    const cartItems = await this.prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      throw new BadRequestException('Giỏ hàng trống.');
    }

    const total = cartItems.reduce((sum, item) => sum + item.quantity * item.product.price, 0);

    // Sử dụng transaction để đảm bảo tất cả các thao tác thành công hoặc không có gì cả
    return this.prisma.$transaction(async (tx) => {
      // 1. Kiểm tra lại số lượng tồn kho trước khi tạo đơn hàng
      for (const item of cartItems) {
        if (item.product.stock < item.quantity) {
          throw new BadRequestException(`Sản phẩm "${item.product.name}" không đủ hàng trong kho.`);
        }
      }

      // 2. Tạo đơn hàng và các mục đơn hàng
      const order = await tx.order.create({
        data: {
          userId,
          totalPrice: total,
          address, // Lưu địa chỉ vào đơn hàng
          status: 'pending',
          orderItems: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price,
            })),
          },
        },
        include: { orderItems: true },
      });

      // 3. Cập nhật (giảm) số lượng tồn kho của sản phẩm
      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // 4. Xóa giỏ hàng của người dùng
      await tx.cartItem.deleteMany({ where: { userId } });

      return order;
    });
  }

  /**
   * Tạo một đơn hàng cho một sản phẩm duy nhất (dành cho chức năng "Mua ngay").
   * @param userId ID của người dùng
   * @param productId ID của sản phẩm
   * @param quantity Số lượng
   * @param address Địa chỉ giao hàng
   * @returns Đơn hàng đã được tạo
   */
  async createOrderFromSingleItem(userId: number, productId: number, quantity: number, address: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Sản phẩm không tồn tại.');
    }
    if (product.stock < quantity) {
      throw new BadRequestException('Không đủ hàng trong kho.');
    }

    const totalPrice = product.price * quantity;

    return this.prisma.$transaction(async (tx) => {
      // 1. Tạo đơn hàng và mục đơn hàng
      const order = await tx.order.create({
        data: {
          userId,
          totalPrice,
          address,
          status: 'pending',
          orderItems: {
            create: {
              productId,
              quantity,
              price: product.price,
            },
          },
        },
        include: { orderItems: true },
      });

      // 2. Cập nhật (giảm) số lượng tồn kho
      await tx.product.update({
        where: { id: productId },
        data: { stock: { decrement: quantity } },
      });

      return order;
    });
  }

  /**
   * Tìm tất cả đơn hàng của một người dùng.
   * @param userId ID của người dùng
   */
  findByUser(userId: number) {
    return this.prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: {
            product: true, // Lấy thêm thông tin chi tiết của sản phẩm trong mỗi mục đơn hàng
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}