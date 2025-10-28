import { Controller, Post, Body, UseGuards, Request, Headers, Res, RawBodyRequest } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { PaymentsService } from './payments.service';
import { Response } from 'express'; // Import Response từ express

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard) // Bảo vệ endpoint này
  @Post('create-payment-intent')
  async createPaymentIntent(@Request() req /*, @Body() body: { orderId?: number } */) {
    // Nếu bạn muốn tạo Order trước rồi mới tạo payment intent, lấy orderId từ body
    // const orderId = body.orderId;
    // return this.paymentsService.createPaymentIntent(orderId);

    // Hoặc tính toán dựa trên userId (lấy từ req.user sau khi qua JwtAuthGuard)
    const userId = req.user.userId;
    return this.paymentsService.createPaymentIntent(userId);
  }

  // Endpoint nhận Webhook từ Stripe (sẽ làm ở bước sau)
  @Post('webhook')
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Request() req: RawBodyRequest<Request>, // Sử dụng RawBodyRequest
    @Res() res: Response // Inject Response để gửi status code
  ) {
     if (!req.rawBody) {
       console.error('Raw body missing from request for webhook');
       return res.status(400).send('Webhook error: Raw body required');
     }
    try {
      await this.paymentsService.handleWebhook(signature, req.rawBody);
      res.status(200).send('Webhook processed');
    } catch (err) {
      console.error('Webhook processing error:', err.message);
      res.status(400).send(`Webhook error: ${err.message}`);
    }
  }
}