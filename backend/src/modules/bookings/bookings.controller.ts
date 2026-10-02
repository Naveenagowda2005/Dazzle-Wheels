import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { SupabaseStorageService } from '../supabase-storage/supabase-storage.service';

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(
    private readonly bookingsService: BookingsService,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  @Post()
  @UseInterceptors(FilesInterceptor('documents', 2))
  async create(
    @Body() createBookingDto: CreateBookingDto,
    @Request() req,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    let documentUrls: { drivingLicense?: string; idProof?: string } = {};

    if (files && files.length > 0) {
      for (const file of files) {
        const url = await this.supabaseStorageService.uploadImage(file, 'licenses');
        if (file.fieldname === 'drivingLicense' || file.fieldname === 'documents') {
          documentUrls.drivingLicense = url;
        } else if (file.fieldname === 'idProof') {
          documentUrls.idProof = url;
        }
      }
    }

    return this.bookingsService.create(
      { ...createBookingDto, ...documentUrls },
      req.user.userId,
    );
  }

  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string, @Request() req?) {
    const userId = req.user.role === 'ADMIN' ? undefined : req.user.userId;
    if (userId) {
      return this.bookingsService.findByUser(userId, page ? parseInt(page) : 1, limit ? parseInt(limit) : 10);
    }
    return this.bookingsService.findAll(page ? parseInt(page) : 1, limit ? parseInt(limit) : 10);
  }

  @Get('stats')
  @UseGuards(AdminGuard)
  getStats() {
    return { message: 'Booking stats not implemented yet' };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  @Patch(':id/approve')
  @UseGuards(AdminGuard)
  approve(@Param('id') id: string) {
    return this.bookingsService.approve(id);
  }

  @Patch(':id/reject')
  @UseGuards(AdminGuard)
  reject(@Param('id') id: string) {
    return this.bookingsService.reject(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto) {
    return this.bookingsService.update(id, updateBookingDto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id') id: string) {
    return this.bookingsService.remove(id);
  }
}