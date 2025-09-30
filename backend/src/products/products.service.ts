import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  findAll(page = 1, pageSize = 12) {
    return this.prisma.product.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: number) {
    return this.prisma.product.findUnique({ where: { id } });
  }

  create(data: any) {
    return this.prisma.product.create({ data });
  }

  update(id: number, data: any) {
    return this.prisma.product.update({ where: { id }, data });
  }

  remove(id: number) {
    return this.prisma.product.delete({ where: { id } });
  }
}
