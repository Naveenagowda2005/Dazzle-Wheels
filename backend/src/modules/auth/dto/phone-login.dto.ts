import { IsString } from 'class-validator';

export class PhoneLoginDto {
  @IsString()
  phone: string;

  @IsString()
  password: string;
}