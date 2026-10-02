import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CarsModule } from './modules/cars/cars.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { BlogsModule } from './modules/blogs/blogs.module';
import { SearchAnalyticsModule } from './modules/search-analytics/search-analytics.module';
import { CouponsModule } from './modules/coupons/coupons.module';
import { EmailModule } from './modules/email/email.module';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { TestimonialsModule } from './modules/testimonials/testimonials.module';
import { ContactModule } from './modules/contact/contact.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      ignoreEnvFile: process.env.NODE_ENV === 'production',
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    DatabaseModule,
    AuthModule,
    UsersModule,
    CarsModule,
    BookingsModule,
    PaymentsModule,
    BlogsModule,
    SearchAnalyticsModule,
    CouponsModule,
    EmailModule,
    CloudinaryModule,
    AnalyticsModule,
    TestimonialsModule,
    ContactModule,
  ],
})
export class AppModule {}