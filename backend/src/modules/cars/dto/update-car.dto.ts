import { PartialType } from '@nestjs/mapped-types';
import { CreateCarDto } from './create-car.dto';
import { IsOptional, IsArray, IsString } from 'class-validator';

export class UpdateCarDto extends PartialType(CreateCarDto) {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsString()
  existingImages?: string;
}