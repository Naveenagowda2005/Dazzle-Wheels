import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-order')
  createOrder(@Body('bookingId') bookingId: string) {
    return this.paymentsService.createOrder(bookingId);
  }

  @Post('verify')
  verifyPayment(@Body() paymentData: any) {
    const { paymentId, orderId, signature, bookingId } = paymentData;
    return this.paymentsService.verifyPayment(paymentId, orderId, signature, bookingId);
  }

  @Get('stats')
  @UseGuards(AdminGuard)
  getStats() {
    // Return basic payment stats
    return { message: 'Payment stats not implemented yet' };
  }
}