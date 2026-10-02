import { IsString, IsDateString, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBookingDto {
  @IsString()
  carId: string;

  @IsDateString()
  pickupTime: string;

  @IsDateString()
  dropTime: string;

  @IsOptional()
  @IsString()
  drivingLicense?: string;

  @IsOptional()
  @IsString()
  idProof?: string;

  @IsOptional()
  @IsString()
  couponCode?: string;
}