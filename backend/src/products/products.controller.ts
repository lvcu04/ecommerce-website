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
  findAll(@Query('page') page = '1', @Query('category') category?: string) { 
    return this.productsService.findAll(Number(page), 12, category); 
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