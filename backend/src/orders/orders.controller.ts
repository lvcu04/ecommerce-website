import { Controller, Post, UseGuards, Request, Get, Body } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create-from-cart') // API cho giỏ hàng
  createFromCart(@Request() req, @Body() body: { address: string }) {
    return this.ordersService.createOrderFromCart(req.user.userId, body.address);
  }

  @UseGuards(JwtAuthGuard)
  @Post('create-single') // API cho "Mua ngay"
  createSingle(@Request() req, @Body() body: { productId: number; quantity: number; address: string }) {
    return this.ordersService.createOrderFromSingleItem(
      req.user.userId,
      body.productId,
      body.quantity,
      body.address,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  getMyOrders(@Request() req) {
    return this.ordersService.findByUser(req.user.userId);
  }
}