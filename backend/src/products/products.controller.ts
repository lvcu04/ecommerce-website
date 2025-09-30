import { Controller, Get, Param, Query, Post, Body, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Get()
  findAll(@Query('page') page = '1') {
    return this.productsService.findAll(Number(page));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(Number(id));
  }

  // Admin endpoints (đặt guard & role check sau)
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() body: any) {
    return this.productsService.create(body);
  }
}
