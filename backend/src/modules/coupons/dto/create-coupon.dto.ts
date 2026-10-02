import { IsString, IsNumber, IsIn, IsOptional, IsBoolean, IsDateString, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCouponDto {
  @IsString()
  code: string;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(0)
  discount: number;

  @IsIn(['PERCENTAGE', 'FLAT'])
  discountType: string;

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(0)
  minAmount?: number;

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(0)
  maxDiscount?: number;

  @IsDateString()
  @Transform(({ value }) => {
    // Convert date string to ISO DateTime if it's just a date
    if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return new Date(value + 'T00:00:00.000Z').toISOString()
    }
    return value
  })
  validFrom: string;

  @IsDateString()
  @Transform(({ value }) => {
    // Convert date string to ISO DateTime if it's just a date
    if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return new Date(value + 'T23:59:59.999Z').toISOString()
    }
    return value
  })
  validTo: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  usageLimit?: number;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  active?: boolean;
}