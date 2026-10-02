import { Module } from '@nestjs/common';
import { CarsService } from './cars.service';
import { CarsController } from './cars.controller';
import { SupabaseStorageModule } from '../supabase-storage/supabase-storage.module';

@Module({
  imports: [SupabaseStorageModule],
  providers: [CarsService],
  controllers: [CarsController],
  exports: [CarsService],
})
export class CarsModule {}