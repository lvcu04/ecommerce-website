import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Query, // Thêm Query
} from '@nestjs/common';
import { ProductsService } from '../products/products.service'; // Import service từ module products
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('admin/products')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Admin)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(
    @Query('page') page: '1',
    @Query('pageSize') pageSize: '10',
    @Query('search') search?: string,
  ){
    return this.productsService.findAll(Number(page), Number(pageSize), search);
  }

  //Lay chi tiet san pham
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.productsService.findOne(id);
    }

    //Tao moi san pham
    @Post()
    create(@Body() createProductDto: any) {
        return this.productsService.create(createProductDto);
    }
    //Cap nhat san pham
    @Put(':id')
    update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateProductDto: any,
    ) {
        return this.productsService.update(id, updateProductDto);
    }
    //Xoa san pham
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.productsService.remove(id);
    }
}
