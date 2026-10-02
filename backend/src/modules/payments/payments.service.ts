import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../../database/database.service';
import { BookingsService } from '../bookings/bookings.service';
import Razorpay from 'razorpay';

@Injectable()
export class PaymentsService {
  private razorpay: Razorpay;

  constructor(
    private databaseService: DatabaseService,
    private configService: ConfigService,
    private bookingsService: BookingsService,
  ) {
    const keyId = this.configService.get('RAZORPAY_KEY_ID');
    const keySecret = this.configService.get('RAZORPAY_KEY_SECRET');
    if (keyId && keySecret) {
      this.razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
    } else {
      console.warn('⚠️  Razorpay not configured. Payment features will be unavailable.');
    }
  }

  async createOrder(bookingId: string) {
    if (!this.razorpay) throw new BadRequestException('Payment gateway not configured');
    const bookings = await this.databaseService.select('bookings', '*', `id=eq.${bookingId}`);
    if (bookings.length === 0) throw new NotFoundException('Booking not found');

    const booking = bookings[0];
    if (booking.booking_status !== 'APPROVED') {
      throw new BadRequestException('Booking must be approved before payment');
    }

    const order = await this.razorpay.orders.create({
      amount: Math.round(booking.total_price * 100),
      currency: 'INR',
      receipt: `bk_${bookingId.slice(0, 36).replace(/-/g, '').slice(0, 36)}`,
    });

    return { orderId: order.id, amount: order.amount, currency: order.currency, bookingId };
  }

  async verifyPayment(paymentId: string, orderId: string, signature: string, bookingId: string) {
    const bookings = await this.databaseService.select('bookings', 'booking_status', `id=eq.${bookingId}`);
    if (bookings.length === 0) throw new NotFoundException('Booking not found');
    if (bookings[0].booking_status !== 'APPROVED') {
      throw new BadRequestException('Booking must be approved before payment');
    }

    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', this.configService.get('RAZORPAY_KEY_SECRET'))
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    if (expectedSignature !== signature) throw new BadRequestException('Invalid payment signature');

    await this.bookingsService.confirmAfterPayment(bookingId, paymentId, orderId);

    return { success: true, message: 'Payment verified and booking confirmed' };
  }

  async getPaymentDetails(paymentId: string) {
    if (!this.razorpay) throw new BadRequestException('Payment gateway not configured');
    try {
      return await this.razorpay.payments.fetch(paymentId);
    } catch {
      throw new NotFoundException('Payment not found');
    }
  }

  async refundPayment(paymentId: string, amount?: number) {
    if (!this.razorpay) throw new BadRequestException('Payment gateway not configured');
    try {
      return await this.razorpay.payments.refund(paymentId, {
        amount: amount ? amount * 100 : undefined,
      });
    } catch {
      throw new BadRequestException('Refund failed');
    }
  }
}