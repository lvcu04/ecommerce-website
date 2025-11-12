// backend/src/payments/payments.service.ts
import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import * as Stripe from 'stripe'; // Correct namespace import
import { Stripe as StripeTypes } from 'stripe';
import { OrdersService } from '../orders/orders.service';
// Import CartService if you implement the suggested improvement
// import { CartService } from '../cart/cart.service';

@Injectable()
export class PaymentsService {
  // private stripeInstance: Stripe; // No longer needed

  constructor(
    @Inject('STRIPE_CLIENT') private stripe: Stripe.default, // Inject the client instance correctly
    private ordersService: OrdersService, // Keep if needed for order status updates
    // Inject CartService if used for calculating amount
    // private cartService: CartService
  ) {
    // Remove incorrect assignment: this.stripeInstance = stripeClient;
  }

  // --- HÀM TÍNH TOÁN SỐ TIỀN CẦN THANH TOÁN ---
  private async calculateOrderAmount(userId: number): Promise<number> {
    // ===>>> RECOMMENDATION: Inject CartService and use a method from it <<<===
    // Example:
    // const total = await this.cartService.getCartTotal(userId);
    // if (total === 0) {
    //   throw new BadRequestException('Cart is empty, cannot create payment intent.');
    // }

    // ----- TEMPORARY LOGIC (using OrdersService's prisma - less ideal) -----
     const cartItems = await (this.ordersService as any).prisma.cartItem.findMany({
       where: { userId },
       include: { product: true },
     });
     if (cartItems.length === 0) {
         throw new BadRequestException('Cart is empty, cannot create payment intent.');
     }
     const total = cartItems.reduce((sum, item) => sum + item.quantity * item.product.price, 0);
    // ------------------------------------

    // VND is a zero-decimal currency for Stripe
    return Math.round(total); // Ensure it's an integer
  }

  async createPaymentIntent(userId: number) {
    try {
      const amount = await this.calculateOrderAmount(userId);

      // 2. Tạo PaymentIntent với Stripe using the injected instance
      const paymentIntent = await this.stripe.paymentIntents.create({ // <-- Use this.stripe
        amount: amount,
        currency: 'vnd',
        metadata: {
          userId: userId.toString(),
          // orderId: orderId.toString(), // If you create an order beforehand
        },
        automatic_payment_methods: {
            enabled: true,
        },
      });

      // 3. Trả về client_secret cho frontend
      return {
        clientSecret: paymentIntent.client_secret,
        amount: amount,
      };
    } catch (error: any) {
      console.error('Error creating PaymentIntent:', error);
      const stripeErrorMessage = error?.raw?.message || error?.message || 'Could not create payment intent.';
      // Consider logging the full error for debugging
      throw new BadRequestException(`Stripe Error: ${stripeErrorMessage}`);
    }
  }

  // Hàm xử lý webhook
  async handleWebhook(signature: string, rawBody: Buffer) {
    let event: StripeTypes.Event;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
        console.error('❌ STRIPE_WEBHOOK_SECRET is not set.');
        throw new BadRequestException('Webhook secret not configured.');
    }

    try {
      event = this.stripe.webhooks.constructEvent( // <-- Use this.stripe
        rawBody,
        signature,
        webhookSecret
      );
    } catch (err: any) {
      console.error(`❌ Error verifying webhook signature: ${err.message}`);
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntentSucceeded = event.data.object as StripeTypes.PaymentIntent;
        console.log('✅ PaymentIntent was successful!', paymentIntentSucceeded.id);
        // TODO: Fulfill the purchase, e.g., update order status in your database
        // const userId = paymentIntentSucceeded.metadata.userId;
        // const orderId = paymentIntentSucceeded.metadata.orderId; // Make sure you have created an order and added its ID to metadata
        // try {
        //   await this.ordersService.updateStatus(Number(orderId), 'processing'); // Example
        //   console.log(`Order ${orderId} status updated to processing.`);
        // } catch (orderError) {
        //   console.error(`Failed to update order status for PaymentIntent ${paymentIntentSucceeded.id}:`, orderError);
        //   // Consider adding retry logic or logging for manual intervention
        // }
        break;
      case 'payment_intent.payment_failed':
        const paymentIntentFailed = event.data.object as StripeTypes.PaymentIntent;
        console.error('❌ PaymentIntent failed:', paymentIntentFailed.id, paymentIntentFailed.last_payment_error?.message);
        // TODO: Notify the user, maybe update order status to 'failed'
        // const orderId = paymentIntentFailed.metadata.orderId;
        // await this.ordersService.updateStatus(Number(orderId), 'failed'); // Example
        break;
      // ... handle other event types as needed
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    console.log("Webhook processed:", event.id);
    // Return a 200 response to Stripe (handled by the controller's @Res())
  }
}