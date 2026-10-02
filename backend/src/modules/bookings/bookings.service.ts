import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class BookingsService {
  constructor(
    private databaseService: DatabaseService,
    private emailService: EmailService,
  ) {}

  private formatDateSafely(dateValue: any): string | null {
    if (!dateValue) return null;
    
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return null;
      return date.toISOString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return null;
    }
  }

  private async enrichBooking(booking: any) {
    const [users, cars] = await Promise.all([
      this.databaseService.select('users', 'id,name,email,phone', `id=eq.${booking.user_id}`),
      this.databaseService.select('cars', 'id,name,brand', `id=eq.${booking.car_id}`),
    ]);
    const user = users[0] || null;
    if (!user) {
      console.warn(`[enrichBooking] No user found for user_id=${booking.user_id}`);
    } else {
      console.log(`[enrichBooking] Found user: ${user.email}`);
    }
    return {
      ...booking,
      bookingId: booking.booking_id || booking.id,
      user,
      car: cars[0] || null,
      pickupTime: this.formatDateSafely(booking.pickup_time),
      dropTime: this.formatDateSafely(booking.drop_time),
      totalPrice: booking.total_price,
      paymentStatus: booking.payment_status,
      bookingStatus: booking.booking_status,
      createdAt: this.formatDateSafely(booking.created_at),
    };
  }

  async create(createBookingDto: CreateBookingDto, userId: string) {
    // Check if car exists and is available
    const cars = await this.databaseService.select('cars', 'id,availability,price_per_day,price_per_hour', `id=eq.${createBookingDto.carId}`);
    
    if (cars.length === 0) {
      throw new NotFoundException('Car not found');
    }

    const car = cars[0];
    if (!car.availability) {
      throw new BadRequestException('Car is not available');
    }

    // Calculate total price (days + remaining hours)
    const startDate = new Date(createBookingDto.pickupTime);
    const endDate = new Date(createBookingDto.dropTime);
    const totalHours = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60)));
    const days = Math.floor(totalHours / 24);
    const remainingHours = totalHours % 24;
    let totalPrice = days * (car.price_per_day || 0) + remainingHours * (car.price_per_hour || 0);

    // Apply coupon discount if provided
    let couponDiscount = 0;
    if (createBookingDto.couponCode) {
      try {
        const coupons = await this.databaseService.select(
          'coupons',
          '*',
          `code=eq.${createBookingDto.couponCode}&active=eq.true`,
        );
        if (coupons.length > 0) {
          const coupon = coupons[0];
          const now = new Date();
          const validTo = new Date(coupon.valid_to);
          if (validTo > now) {
            if (coupon.discount_type === 'PERCENTAGE') {
              couponDiscount = Math.round((totalPrice * coupon.discount) / 100);
              if (coupon.max_discount) couponDiscount = Math.min(couponDiscount, coupon.max_discount);
            } else {
              couponDiscount = coupon.discount;
            }
          }
        }
      } catch (_) { /* ignore coupon errors, proceed without discount */ }
    }
    totalPrice = Math.max(0, totalPrice - couponDiscount);

    const data = {
      id: this.databaseService.generateId(),
      booking_id: `BK-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      user_id: userId,
      car_id: createBookingDto.carId,
      pickup_time: this.databaseService.formatDate(startDate),
      drop_time: this.databaseService.formatDate(endDate),
      driving_license: createBookingDto.drivingLicense,
      id_proof: createBookingDto.idProof || null,
      total_price: totalPrice,
      booking_status: 'PENDING',
      payment_status: 'UNPAID',
      created_at: this.databaseService.formatDate(new Date()),
      updated_at: this.databaseService.formatDate(new Date())
    };

    const result = await this.databaseService.insert('bookings', data);
    // Supabase returns an array with Prefer: return=representation
    const inserted = Array.isArray(result) ? result[0] : result;

    // Send booking submitted email — fire and forget, never block response
    this.enrichBooking(inserted)
      .then(enriched => this.emailService.sendBookingSubmitted(enriched))
      .catch(e => console.error('Email error on submit:', e?.message));

    return inserted;
  }

  async findAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    // Get bookings with basic data
    const [bookings, total] = await Promise.all([
      this.databaseService.select('bookings', '*', `order=created_at.desc&limit=${limit}&offset=${offset}`),
      this.databaseService.count('bookings'),
    ]);

    // Enrich bookings with user and car data
    const enrichedBookings = await Promise.all(bookings.map((b) => this.enrichBooking(b)));

    return {
      bookings: enrichedBookings,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  async findByUser(userId: string, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const [bookings, total] = await Promise.all([
      this.databaseService.select('bookings', '*', `user_id=eq.${userId}&order=created_at.desc&limit=${limit}&offset=${offset}`),
      this.databaseService.count('bookings', `user_id=eq.${userId}`),
    ]);

    const enrichedBookings = await Promise.all(bookings.map((b) => this.enrichBooking(b)));

    return {
      bookings: enrichedBookings,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const bookings = await this.databaseService.select('bookings', '*', `id=eq.${id}`);
    if (bookings.length === 0) throw new NotFoundException('Booking not found');
    return this.enrichBooking(bookings[0]);
  }

  async update(id: string, updateBookingDto: UpdateBookingDto) {
    const bookings = await this.databaseService.select('bookings', 'id', `id=eq.${id}`);
    
    if (bookings.length === 0) {
      throw new NotFoundException('Booking not found');
    }

    const updatedData = {
      ...updateBookingDto,
      updated_at: this.databaseService.formatDate(new Date())
    };

    return this.databaseService.update('bookings', updatedData, `id=eq.${id}`);
  }

  async updateStatus(id: string, status: string) {
    const bookings = await this.databaseService.select('bookings', 'id', `id=eq.${id}`);
    
    if (bookings.length === 0) {
      throw new NotFoundException('Booking not found');
    }

    const updatedData = {
      booking_status: status,
      updated_at: this.databaseService.formatDate(new Date())
    };

    return this.databaseService.update('bookings', updatedData, `id=eq.${id}`);
  }

  async approve(id: string) {
    const bookings = await this.databaseService.select('bookings', '*', `id=eq.${id}`);
    if (bookings.length === 0) throw new NotFoundException('Booking not found');
    if (!['PENDING', 'REJECTED'].includes(bookings[0].booking_status)) {
      throw new BadRequestException(`Booking is already ${bookings[0].booking_status}`);
    }
    await this.databaseService.update('bookings', {
      booking_status: 'APPROVED',
      updated_at: this.databaseService.formatDate(new Date()),
    }, `id=eq.${id}`);
    // Fire and forget — never block the approve response
    this.enrichBooking({ ...bookings[0], booking_status: 'APPROVED' })
      .then(async enriched => {
        // Fallback: if enrichBooking didn't find the user, query directly
        if (!enriched.user?.email) {
          console.warn('[Booking] enrichBooking returned no user email, trying direct lookup...');
          const users = await this.databaseService.select('users', 'id,name,email', `id=eq.${bookings[0].user_id}`);
          if (users[0]) {
            enriched.userEmail = users[0].email;
            enriched.userName = users[0].name;
            console.log('[Booking] Direct lookup found email:', users[0].email);
          }
        }
        console.log(`[Booking] Sending approval email to: ${enriched.user?.email || enriched.userEmail}`);
        return this.emailService.sendBookingApproved(enriched);
      })
      .catch(e => console.error('[Booking] Email error on approve:', e?.message));
    return { message: 'Booking approved' };
  }

  async reject(id: string) {
    const bookings = await this.databaseService.select('bookings', '*', `id=eq.${id}`);
    if (bookings.length === 0) throw new NotFoundException('Booking not found');
    if (bookings[0].booking_status === 'COMPLETED' || bookings[0].booking_status === 'CANCELLED') {
      throw new BadRequestException(`Booking is already ${bookings[0].booking_status}`);
    }
    await this.databaseService.update('bookings', {
      booking_status: 'REJECTED',
      updated_at: this.databaseService.formatDate(new Date()),
    }, `id=eq.${id}`);
    // Fire and forget
    this.enrichBooking({ ...bookings[0], booking_status: 'REJECTED' })
      .then(async enriched => {
        if (!enriched.user?.email) {
          const users = await this.databaseService.select('users', 'id,name,email', `id=eq.${bookings[0].user_id}`);
          if (users[0]) { enriched.userEmail = users[0].email; enriched.userName = users[0].name; }
        }
        console.log(`[Booking] Sending rejection email to: ${enriched.user?.email || enriched.userEmail}`);
        return this.emailService.sendBookingRejected(enriched);
      })
      .catch(e => console.error('[Booking] Email error on reject:', e?.message));
    return { message: 'Booking rejected' };
  }

  async confirmAfterPayment(id: string, paymentId: string, orderId: string) {
    await this.databaseService.update('bookings', {
      booking_status: 'CONFIRMED',
      payment_status: 'PAID',
      updated_at: this.databaseService.formatDate(new Date()),
    }, `id=eq.${id}`);
    try {
      const bookings = await this.databaseService.select('bookings', '*', `id=eq.${id}`);
      if (bookings.length > 0) {
        const enriched = await this.enrichBooking(bookings[0]);
        await this.emailService.sendPaymentSuccess(enriched);
      }
    } catch (e) { console.error('Email error:', e); }
  }

  async updatePaymentStatus(id: string, paymentStatus: string) {
    const bookings = await this.databaseService.select('bookings', 'id', `id=eq.${id}`);
    
    if (bookings.length === 0) {
      throw new NotFoundException('Booking not found');
    }

    const updatedData = {
      payment_status: paymentStatus,
      updated_at: this.databaseService.formatDate(new Date())
    };

    return this.databaseService.update('bookings', updatedData, `id=eq.${id}`);
  }

  async remove(id: string) {
    const bookings = await this.databaseService.select('bookings', 'id', `id=eq.${id}`);
    
    if (bookings.length === 0) {
      throw new NotFoundException('Booking not found');
    }

    // Delete related payments first (foreign key constraint)
    await this.databaseService.delete('payments', `booking_id=eq.${id}`);

    return this.databaseService.delete('bookings', `id=eq.${id}`);
  }
}