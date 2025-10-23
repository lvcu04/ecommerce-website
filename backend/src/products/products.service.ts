// lvcu04/ecommerce-website/ecommerce-website-8699e455164d40ef3d8bd27acef9741e5b99de32/backend/src/products/products.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma, Product } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(page = 1, pageSize = 12, category?: string, search?: string) {
    const where: Prisma.ProductWhereInput = {};

    if (category) {
      where.category = { name: { equals: category, mode: 'insensitive' } };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const total = await this.prisma.product.count({ where });
    const products = await this.prisma.product.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: { category: true },
    });

    return {
      products,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / pageSize),
    };
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