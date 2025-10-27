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
  ) {
    // Bạn cần thêm phương thức findAll vào OrdersService để hỗ trợ phân trang và lọc
    // Ví dụ: return this.ordersService.findAllForAdmin({ page: Number(page), pageSize: Number(pageSize), status });
    // Tạm thời gọi phương thức cũ findByUser với một ID admin giả định hoặc tạo hàm mới
    // Đây chỉ là ví dụ, bạn cần implement logic lấy TẤT CẢ đơn hàng trong OrdersService
    console.warn('Cần implement OrdersService.findAllForAdmin()');
    return { message: 'API lấy tất cả đơn hàng cho admin (chưa implement)', page, pageSize, status };
    // Hoặc nếu muốn lấy của 1 user cụ thể:
    // return this.ordersService.findByUser(SOME_USER_ID);
  }

  // Lấy chi tiết một đơn hàng
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    // Bạn có thể cần tạo phương thức findOneForAdmin trong OrdersService
    // để bao gồm thông tin chi tiết hơn nếu cần
    console.warn('Cần implement OrdersService.findOneForAdmin() nếu cần chi tiết hơn');
     // Tạm thời chưa có hàm tìm theo ID, cần thêm vào OrdersService
     return { message: `API lấy chi tiết đơn hàng ${id} (chưa implement)`};
     // Ví dụ khi có hàm: return this.ordersService.findOneForAdmin(id);
  }

  // Cập nhật trạng thái đơn hàng
  @Patch(':id/status') // Dùng PATCH vì chỉ cập nhật một phần
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status: string }, // Nên tạo DTO và Enum cho status
  ) {
     // Bạn cần thêm phương thức updateStatus vào OrdersService
     // Ví dụ: return this.ordersService.updateStatus(id, body.status);
     console.warn('Cần implement OrdersService.updateStatus()');
     return { message: `API cập nhật trạng thái đơn hàng ${id} thành ${body.status} (chưa implement)`};
  }

  // Các API khác cho admin nếu cần (ví dụ: xóa đơn hàng - cẩn thận khi implement)
}