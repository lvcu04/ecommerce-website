import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';
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

  async findAllForAdmin(options: { page: number; pageSize: number; status?: string; userId?: number }) {
    const { page, pageSize, status, userId } = options;
    const where: Prisma.OrderWhereInput = {};

    if (status) {
      where.status = status;
    }
    if (userId) {
      where.userId = userId;
    }

    const total = await this.prisma.order.count({ where });
    const orders = await this.prisma.order.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, email: true, name: true } }, // Lấy thông tin người dùng
        orderItems: { include: { product: { select: { id: true, name: true, imageUrl: true } } } }, // Lấy thông tin sản phẩm rút gọn
      },
    });

    return {
      orders,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  // Hàm mới cho Admin xem chi tiết đơn hàng
  async findOneForAdmin(id: number) {
    const order = await this.prisma.order.findUnique({
       where: { id },
       include: {
         user: { select: { id: true, email: true, name: true } },
         orderItems: { include: { product: true } }, // Lấy đầy đủ thông tin sản phẩm
       },
     });
     if (!order) {
       throw new NotFoundException(`Order with ID ${id} not found`);
     }
     return order;
   }

  // Hàm mới cho Admin cập nhật trạng thái đơn hàng
  async updateStatus(id: number, status: string) {
    // 1. Định nghĩa các trạng thái
    // (Giữ nguyên `canceled` (1 'l') và 'delivered' như code gốc của bạn)
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'completed', 'canceled', 'returned'];
    const restockStatuses = ['canceled', 'returned']; // Các trạng thái kích hoạt hoàn kho

    if (!validStatuses.includes(status)) {
      throw new BadRequestException(`Invalid status: ${status}`);
    }

    // 2. Lấy đơn hàng và các sản phẩm bên trong
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: true, // QUAN TRỌNG: Lấy các sản phẩm để hoàn kho
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    const oldStatus = order.status;

    // 3. Kiểm tra logic hoàn kho
    // Chỉ hoàn kho nếu:
    // - Trạng thái MỚI là 'canceled' hoặc 'returned'
    // - VÀ Trạng thái CŨ CHƯA PHẢI là 'canceled' hoặc 'returned' (để tránh hoàn kho 2 lần)
    const shouldRestock = restockStatuses.includes(status) && !restockStatuses.includes(oldStatus);

    if (shouldRestock) {
      // 4. Sử dụng Transaction để đảm bảo an toàn dữ liệu
      // Hoặc hoàn tất cả, hoặc không làm gì cả
      return this.prisma.$transaction(async (tx) => {
        // 4a. Cộng lại số lượng tồn kho cho từng sản phẩm
        const productRestockPromises = order.orderItems.map(item =>
          tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity, // Cộng (increment) số lượng trở lại
              },
            },
          }),
        );
        
        // Chờ tất cả sản phẩm được cập nhật
        await Promise.all(productRestockPromises);

        // 4b. Cập nhật trạng thái của đơn hàng
        const updatedOrder = await tx.order.update({
          where: { id },
          data: { status },
        });

        return updatedOrder;
      });
    } else {
      // 5. Nếu không cần hoàn kho (ví dụ: pending -> processing), chỉ cần cập nhật trạng thái
      return this.prisma.order.update({
        where: { id },
        data: { status },
      });
    }
  }
}