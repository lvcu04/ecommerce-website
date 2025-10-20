import { Controller, Post, Body, UseGuards, Request, Get, Delete, Put, Param, ParseIntPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CartService } from './cart.service';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private cartService: CartService) {}

  @Post('add')
  add(@Request() req, @Body() body: { productId: number; quantity?: number }) {
    return this.cartService.addToCart(req.user.userId, body.productId, body.quantity || 1);
  }

  @Get()
  get(@Request() req) {
    return this.cartService.getCart(req.user.userId);
  }

  @Delete('clear')
  clear(@Request() req) {
    return this.cartService.clearCart(req.user.userId);
  }
  
  @Put(':itemId/quantity')
  updateQuantity(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Request() req,
    @Body('quantity', ParseIntPipe) quantity: number,
  ) {
    return this.cartService.updateQuantity(itemId, req.user.userId, quantity);
  }
  @Delete(':/clear')
  removeOne(@Param('itemId', ParseIntPipe) itemId: number, @Request() req) {
    return this.cartService.removeItemByItemId(itemId, req.user.userId);
  }
}
