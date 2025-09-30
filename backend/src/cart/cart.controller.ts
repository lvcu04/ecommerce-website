import { Controller, Post, Body, UseGuards, Request, Get, Delete } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CartService } from './cart.service';

@Controller('cart')
export class CartController {
  constructor(private cartService: CartService) {}

  @UseGuards(JwtAuthGuard)
  @Post('add')
  add(@Request() req, @Body() body: { productId: number; quantity?: number }) {
    return this.cartService.addToCart(req.user.userId, body.productId, body.quantity || 1);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  get(@Request() req) {
    return this.cartService.getCart(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('clear')
  clear(@Request() req) {
    return this.cartService.clearCart(req.user.userId);
  }
}
