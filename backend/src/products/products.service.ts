// lvcu04/ecommerce-website/ecommerce-website-4aa712de464d3c3e54b59a353190ac2820039d81/backend/src/products/products.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client'; // Import Prisma để sử dụng QueryMode

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  findAll(page = 1, pageSize = 12, category?: string) {
    const where: Prisma.ProductWhereInput = category
      ? { category: { name: { equals: category, mode: 'insensitive' } } }
      : {};

    return this.prisma.product.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    });
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  create(data: any) {
    return this.prisma.product.create({ data });
  }

  async update(id: number, data: any) {
    await this.findOne(id);
    return this.prisma.product.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.product.delete({
      where: { id },
    });
  }
}