import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const users = await this.prisma.user.findMany();
    // Loại bỏ trường password khỏi mỗi user object
    return users.map(({ password, ...rest }) => rest);
  }

  findById(id: number) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  updateProfile(id: number, data: any) {
    return this.prisma.user.update({ where: { id }, data });
  }
}
