import {
  Controller,
  Get,
  Put,
  Param,
  ParseIntPipe,
  UseGuards,
  Query, // Thêm Query
  Body, // Thêm Body
  Patch, // Sử dụng Patch cho cập nhật trạng thái
} from '@nestjs/common';
import { OrdersService } from '../orders/orders.service'; // Import service từ module orders
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('admin/orders') // Đặt prefix là 'admin/orders'
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Admin)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // Lấy danh sách tất cả đơn hàng (có phân trang)
  @Get()
  async findAll(
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '10',
    // Thêm các query param khác nếu cần lọc (ví dụ: status, userId)
    @Query('status') status?: string,
    @Query('userId', new ParseIntPipe({ optional: true})) userId?: number,
  ) {
    return this.ordersService.findAllForAdmin({
      page: Number(page),
      pageSize: parseInt(pageSize, 10),
      status,
      userId,
    });
  }

  // Lấy chi tiết một đơn hàng
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ordersService.findOneForAdmin(id);
  }

  // Cập nhật trạng thái đơn hàng
  @Patch(':id/status') // Dùng PATCH vì chỉ cập nhật một phần
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status: string }, // Nên tạo DTO và Enum cho status
  ) {
    return this.ordersService.updateStatus(id, body.status);
  }

  // Các API khác cho admin nếu cần (ví dụ: xóa đơn hàng - cẩn thận khi implement)
}