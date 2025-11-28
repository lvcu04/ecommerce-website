// lvcu04/ecommerce-website/ecommerce-website-8699e455164d40ef3d8bd27acef9741e5b99de32/backend/src/products/products.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma, Product } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    page = 1, 
    pageSize = 12, 
    category?: string, 
    search?: string,
    // Nhận các tham số mới
    sort?: string,
    minPrice?: number,
    maxPrice?: number
  ) {
    // 1. Xây dựng điều kiện lọc (WHERE)
    const where: Prisma.ProductWhereInput = {};

    // Lọc theo danh mục
    if (category) {
      where.category = { name: { equals: category, mode: 'insensitive' } };
    }

    // Lọc theo từ khóa tìm kiếm
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Lọc theo khoảng giá (Price Range)
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) {
        where.price.gte = minPrice; // gte: Greater Than or Equal (>=)
      }
      if (maxPrice !== undefined) {
        where.price.lte = maxPrice; // lte: Less Than or Equal (<=)
      }
    }

    // 2. Xây dựng điều kiện sắp xếp (ORDER BY)
    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: 'desc' }; // Mặc định: Mới nhất

    switch (sort) {
      case 'price_asc':
        orderBy = { price: 'asc' }; // Giá tăng dần
        break;
      case 'price_desc':
        orderBy = { price: 'desc' }; // Giá giảm dần
        break;
      case 'oldest':
        orderBy = { createdAt: 'asc' }; // Cũ nhất
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' }; // Mới nhất (mặc định)
        break;
      case 'name_asc':
        orderBy = { name: 'asc' }; // Tên A-Z
        break;
      // Có thể thêm case 'bestseller' nếu có trường 'sold' trong DB
    }

    // 3. Thực hiện truy vấn DB
    const total = await this.prisma.product.count({ where });
    const products = await this.prisma.product.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: orderBy, // Áp dụng sắp xếp
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