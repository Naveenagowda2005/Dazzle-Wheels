import { Injectable, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class TestimonialsService {
  constructor(private databaseService: DatabaseService) {}

  async findAll(limit = 6) {
    return this.databaseService.select('testimonials', '*', `is_active=eq.true&order=created_at.desc&limit=${limit}`);
  }

  async findFeatured(limit = 3) {
    return this.databaseService.select('testimonials', '*', `is_active=eq.true&rating=gte.4&order=rating.desc,created_at.desc&limit=${limit}`);
  }

  async createFromBooking(bookingId: string, userId: string, rating: number, review: string) {
    // Validate booking belongs to user and is COMPLETED
    const bookings = await this.databaseService.select('bookings', 'id,booking_status,user_id,car_id', `id=eq.${bookingId}`);
    if (bookings.length === 0) throw new BadRequestException('Booking not found');
    const booking = bookings[0];
    console.log(`[Review] booking.user_id="${booking.user_id}" userId="${userId}" status="${booking.booking_status}"`);
    // Normalize comparison — trim whitespace just in case
    if (String(booking.user_id).trim() !== String(userId).trim()) throw new BadRequestException('Not your booking');
    if (booking.booking_status !== 'COMPLETED') throw new BadRequestException('Booking is not completed yet');

    // Check if already reviewed
    const existing = await this.databaseService.select('testimonials', 'id', `booking_id=eq.${bookingId}`);
    if (existing.length > 0) throw new BadRequestException('You have already reviewed this booking');

    // Get user name
    const users = await this.databaseService.select('users', 'name', `id=eq.${userId}`);
    const userName = users[0]?.name || 'Customer';

    // Get car name
    const cars = await this.databaseService.select('cars', 'name,brand', `id=eq.${booking.car_id}`);
    const carName = cars[0] ? `${cars[0].name} (${cars[0].brand})` : 'Car';

    const data = {
      id: this.databaseService.generateId(),
      user_id: userId,
      booking_id: bookingId,
      name: userName,
      rating: Math.min(5, Math.max(1, Math.round(rating))),
      comment: review,
      car_name: carName,
      is_active: true,
      created_at: this.databaseService.formatDate(new Date()),
    };

    await this.databaseService.insert('testimonials', data);
    return { success: true, message: 'Thank you for your review!' };
  }
}