import { Controller, Post, UseGuards, Request, Get, Body } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  create(@Request() req, @Body() body: { address: string }) {
    return this.ordersService.createOrderFromCart(req.user.userId, body.address);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  getMyOrders(@Request() req) {
    return this.ordersService.findByUser(req.user.userId);
  }
}
