
import { Module } from '@nestjs/common';
import { Stripe } from 'stripe';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { OrdersModule } from '../orders/orders.module';

@Module({
    imports: [OrdersModule],
    controllers: [PaymentsController],
    providers: [
        PaymentsService,
        {
            provide: 'STRIPE_CLIENT',
            useFactory: () => {
                return new Stripe(process.env.STRIPE_SECRET_KEY, {
                    apiVersion: '2025-09-30.clover',
                });
            },
        },
    ],
    exports: [PaymentsService],
})
export class PaymentsModule {}
