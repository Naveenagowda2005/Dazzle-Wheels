import { IsString, IsNumber, IsBoolean, IsOptional, IsArray, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCarDto {
  @IsString()
  name: string;

  @IsString()
  brand: string;

  @IsString()
  fuelType: string;

  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  seats: number;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(0)
  pricePerHour: number;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(0)
  pricePerDay: number;

  @IsString()
  city: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  availability?: boolean;
}