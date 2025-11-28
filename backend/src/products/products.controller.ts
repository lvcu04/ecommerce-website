import { Controller, Get, Param, Query, Post, Body, UseGuards, Put, Delete, ParseIntPipe } from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
// highlight-start
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';
// highlight-end

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}
  
  // Cho phép mọi người xem danh sách sản phẩm (không cần Auth)
  @Get()
  findAll(
    @Query('page') page = '1', 
    @Query('pageSize') pageSize = '12', // Thêm pageSize để linh động (mặc định 12 cho User)
    @Query('category') category?: string, 
    @Query('search') search?: string,
    
    // --- CÁC THAM SỐ MỚI ---
    @Query('sort') sort?: string,           // ví dụ: 'price_asc', 'newest'
    @Query('minPrice') minPrice?: string,   // Query gửi lên là string, cần ép kiểu
    @Query('maxPrice') maxPrice?: string,
  ) { 
    return this.productsService.findAll(
      Number(page), 
      Number(pageSize), 
      category, 
      search,
      sort,                 // Truyền sort xuống service
      minPrice ? Number(minPrice) : undefined, // Ép kiểu sang number
      maxPrice ? Number(maxPrice) : undefined  // Ép kiểu sang number
    ); 
  }
  
  // Xóa Guard để cho phép mọi người xem chi tiết sản phẩm (GET /products/:id)
  // @UseGuards(JwtAuthGuard, RolesGuard) // highlight-line
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(Number(id));
  }

  // --- Các route cần quyền Admin vẫn được bảo vệ ---

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Post()
  create(@Body() body: any) {
    return this.productsService.create(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Put(':id')
  update(@Param('id',ParseIntPipe) id: number, @Body() body: any) {
      return this.productsService.update(id, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin)
  @Delete(':id')
  remove(@Param('id',ParseIntPipe) id: number) {
      return this.productsService.remove(id);
  }
}