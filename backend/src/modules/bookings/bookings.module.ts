import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { SupabaseStorageModule } from '../supabase-storage/supabase-storage.module';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [SupabaseStorageModule, EmailModule],
  providers: [BookingsService],
  controllers: [BookingsController],
  exports: [BookingsService],
})
export class BookingsModule {}