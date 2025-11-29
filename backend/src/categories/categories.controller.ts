import { Controller, Get, Post, Put, Delete, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@Controller('categories')
export class CategoriesController {
    constructor(private categoriesService: CategoriesService) {}

    // Public: Lấy danh sách
    @Get()
    async findAll() {
        return this.categoriesService.findAll();
    }

    // --- CÁC ROUTE ADMIN ---
    
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Admin)
    @Post()
    create(@Body('name') name: string) {
        return this.categoriesService.create(name);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Admin)
    @Put(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body('name') name: string) {
        return this.categoriesService.update(id, name);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(Role.Admin)
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.categoriesService.remove(id);
    }
}