import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async addToCart(userId: number, productId: number, quantity = 1) {
    const existing = await this.prisma.cartItem.findFirst({
      where: { userId, productId },
    });

    if (existing) {
      return this.prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + quantity },
      });
    }
    return this.prisma.cartItem.create({
      data: { userId, productId, quantity },
    });
  }

  getCart(userId: number) {
    return this.prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });
  }

  async removeItem(itemId: number) {
    return this.prisma.cartItem.delete({ where: { id : itemId } });
  }
  async removeItemById(itemId: number, userId: number) {
    const cartItem = await this.prisma.cartItem.findUnique({ where: { id: itemId } });
    if (!cartItem || cartItem.userId !== userId) {
      throw new NotFoundException(`Cart item with ID ${itemId} not found or doesn't belong to user.`);
    }
  }

  async clearCart(userId: number) {
    return this.prisma.cartItem.deleteMany({ where: { userId } });
  }

async updateQuantity(itemId: number, userId: number, newQuantity: number) { 
  if (newQuantity <= 0) {
    return this.removeItemById(itemId, userId);
  }
  const cartItem = await this.prisma.cartItem.findUnique({ where: { id : itemId } });
  if (!cartItem || cartItem.userId !== userId) {
    throw new NotFoundException(`Cart item with ID ${itemId} not found or doesn't belong to user.`);
  }
  return this.prisma.cartItem.update({
    where: { id : itemId },
    data: { quantity: newQuantity },
    include: { product: true },
  });
  }
  async removeItemByItemId(itemId: number, userId: number) {
    const cartItem = await this.prisma.cartItem.findUnique({ where: { id: itemId } });

    if (!cartItem || cartItem.userId !== userId) {
        throw new NotFoundException(`Cart item with ID ${itemId} not found or doesn't belong to user.`);
    }
    
    return this.prisma.cartItem.delete({ where: { id: itemId } });
  }
}