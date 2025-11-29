import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.category.findMany();
  }

  // --- THÊM CÁC HÀM MỚI ---
  async create(name: string) {
    return this.prisma.category.create({
      data: { name },
    });
  }

  async update(id: number, name: string) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');
    
    return this.prisma.category.update({
      where: { id },
      data: { name },
    });
  }

  async remove(id: number) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) throw new NotFoundException('Category not found');

    // Tùy chọn: Xử lý sản phẩm thuộc danh mục này trước khi xóa (vd: set null)
    // Hiện tại Prisma schema đã có 'onDelete: SetNull' nên an toàn
    return this.prisma.category.delete({
      where: { id },
    });
  }
}