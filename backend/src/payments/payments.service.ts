import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import Stripe from 'stripe';
import { OrdersService } from '../orders/orders.service'; // Import nếu cần lấy giá từ order

@Injectable()
export class PaymentsService {
  constructor(
    @Inject('STRIPE_CLIENT') private stripe: Stripe,
    private ordersService: OrdersService, // Inject nếu cần
  ) {}

  // --- HÀM TÍNH TOÁN SỐ TIỀN CẦN THANH TOÁN ---
  // Ví dụ đơn giản: Tính từ giỏ hàng (cần logic lấy cartItems từ userId)
  // HOẶC lấy từ Order đã tạo (cần orderId)
  private async calculateOrderAmount(userId: number /* hoặc orderId: number */): Promise<number> {
    // ===>>> THAY THẾ LOGIC NÀY BẰNG CÁCH TÍNH TỔNG TIỀN THỰC TẾ <<<===
    // Ví dụ: lấy tổng tiền từ Order đã được tạo ở trạng thái pending
    // const order = await this.ordersService.findPendingOrderById(orderId);
    // if (!order) throw new NotFoundException('Order not found');
    // return order.totalPrice;

    // Ví dụ tạm: Giả sử tổng tiền là 100.000 VND
    const tempAmount = 100000;
    // Stripe tính bằng đơn vị nhỏ nhất (xu), nên cần nhân 100 nếu đơn vị là đồng
    // Tuy nhiên, VND không có đơn vị xu, Stripe xử lý VND là số nguyên.
    // Xem tài liệu Stripe về zero-decimal currencies: https://stripe.com/docs/currencies#zero-decimal
    return Math.round(tempAmount); // Đảm bảo là số nguyên
  }

  async createPaymentIntent(userId: number /* hoặc orderId: number */) {
    try {
      // 1. Tính toán số tiền (thay bằng logic thực tế của bạn)
      const amount = await this.calculateOrderAmount(userId);

      // 2. Tạo PaymentIntent với Stripe
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: amount,
        currency: 'vnd', // Sử dụng mã tiền tệ Việt Nam Đồng
        // Thêm metadata nếu cần để liên kết với đơn hàng hoặc người dùng
        metadata: {
          userId: userId.toString(),
          // orderId: orderId.toString(), // Nếu bạn tạo order trước
        },
        automatic_payment_methods: {
            enabled: true, // Cho phép Stripe tự động quản lý các phương thức thanh toán
        },
      });

      // 3. Trả về client_secret cho frontend
      return {
        clientSecret: paymentIntent.client_secret,
        amount: amount, // Có thể trả về số tiền để frontend hiển thị
      };
    } catch (error) {
      console.error('Error creating PaymentIntent:', error);
      throw new BadRequestException('Could not create payment intent.');
    }
  }

  // Hàm xử lý webhook (sẽ implement sau)
  async handleWebhook(signature: string, rawBody: Buffer) {
    // ... logic xác thực và xử lý sự kiện webhook ...
    console.log("Webhook received (implementation pending)");
  }
}