import { Module } from '@nestjs/common';
import { BlogsService } from './blogs.service';
import { BlogsController } from './blogs.controller';
import { SupabaseStorageModule } from '../supabase-storage/supabase-storage.module';

@Module({
  imports: [SupabaseStorageModule],
  providers: [BlogsService],
  controllers: [BlogsController],
})
export class BlogsModule {}