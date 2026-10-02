import { IsOptional, IsString, IsDateString } from 'class-validator';

export class CreateSearchAnalyticsDto {
  @IsOptional()
  @IsString()
  searchCity?: string;

  @IsOptional()
  @IsDateString()
  pickupTime?: string;
}