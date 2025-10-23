import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, productId: number, rating: number, comment: string) {
    // 1. Kiểm tra xem người dùng đã từng mua sản phẩm này chưa
    const hasPurchased = await this.prisma.order.findFirst({
      where: {
        userId,
        status: 'completed', // Chỉ tính các đơn hàng đã hoàn thành
        orderItems: {
          some: {
            productId,
          },
        },
      },
    });

    if (!hasPurchased) {
      throw new UnauthorizedException('Bạn phải mua sản phẩm này trước khi có thể đánh giá.');
    }

    // 2. Kiểm tra xem người dùng đã đánh giá sản phẩm này chưa
    const existingReview = await this.prisma.review.findFirst({
      where: {
        userId,
        productId,
      },
    });

    if (existingReview) {
      throw new BadRequestException('Bạn đã đánh giá sản phẩm này rồi.');
    }
    
    // 3. Tạo đánh giá mới
    return this.prisma.review.create({
      data: {
        userId,
        productId,
        rating,
        comment,
      },
    });
  }

  findByProduct(productId: number) {
    return this.prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            name: true, // Chỉ lấy tên của người dùng
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}