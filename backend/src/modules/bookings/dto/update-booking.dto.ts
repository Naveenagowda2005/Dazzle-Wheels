import { PartialType } from '@nestjs/mapped-types';
import { CreateBookingDto } from './create-booking.dto';
import { IsOptional, IsIn } from 'class-validator';

export class UpdateBookingDto extends PartialType(CreateBookingDto) {
  @IsOptional()
  @IsIn(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'])
  bookingStatus?: string;

  @IsOptional()
  @IsIn(['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'])
  paymentStatus?: string;
}