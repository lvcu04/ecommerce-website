import { Controller, Post, Body, Get, Param, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req, @Body() body: { productId: number; rating: number; comment: string }) {
    return this.reviewsService.create(req.user.userId, body.productId, body.rating, body.comment);
  }

  @Get('product/:productId')
  findByProduct(@Param('productId', ParseIntPipe) productId: number) {
    return this.reviewsService.findByProduct(productId);
  }
  @Get('stats/:productId')
  getStats(@Param('productId', ParseIntPipe) productId: number) {
    return this.reviewsService.getProductStats(productId);
  }
}