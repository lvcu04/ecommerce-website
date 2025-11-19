// backend/src/admin/dashboard.controller.ts

import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
import { PrismaService } from '../prisma.service';

@Controller('admin/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Admin)
export class DashboardController {
  constructor(private prisma: PrismaService) {}

  @Get('stats')
  async getStats() {
    // 1. Đếm tổng số người dùng (trừ admin nếu muốn, ở đây đếm hết)
    const totalUsers = await this.prisma.user.count();

    // 2. Đếm tổng số sản phẩm
    const totalProducts = await this.prisma.product.count();

    // 3. Đếm tổng số đơn hàng
    const totalOrders = await this.prisma.order.count();

    // 4. Đếm số đơn hàng mới (pending)
    const pendingOrders = await this.prisma.order.count({
      where: { status: 'pending' },
    });

    // 5. Tính tổng doanh thu (chỉ tính các đơn đã hoàn thành 'completed')
    const revenueAgg = await this.prisma.order.aggregate({
      _sum: {
        totalPrice: true,
      },
      where: {
        status: 'completed',
      },
    });
    const totalRevenue = revenueAgg._sum.totalPrice || 0;

    return {
      totalUsers,
      totalProducts,
      totalOrders,
      pendingOrders,
      totalRevenue,
    };
  }
}