import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { CarsService } from './cars.service';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { SearchCarsDto } from './dto/search-cars.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { SupabaseStorageService } from '../supabase-storage/supabase-storage.service';

@Controller('cars')
export class CarsController {
  constructor(
    private readonly carsService: CarsService,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @UseInterceptors(FilesInterceptor('images', 10))
  async create(
    @Body() createCarDto: CreateCarDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    let imageUrls: string[] = [];

    if (files && files.length > 0) {
      try {
        console.log(`Uploading ${files.length} images to Supabase...`);
        imageUrls = await this.supabaseStorageService.uploadMultipleImages(files, 'cars');
        console.log('Images uploaded successfully to Supabase:', imageUrls);
      } catch (error) {
        console.error('Supabase upload failed:', error);
        throw new Error(`Failed to upload images: ${error.message}`);
      }
    }

    return this.carsService.create({
      ...createCarDto,
      images: imageUrls,
    });
  }

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.carsService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
    );
  }

  @Get('search')
  search(@Query() searchDto: SearchCarsDto) {
    const { page, limit, ...searchParams } = searchDto;
    
    return this.carsService.search(searchParams);
  }

  @Get('featured')
  getFeatured(@Query('limit') limit?: string) {
    return this.carsService.findFeatured(
      limit ? parseInt(limit) : 6,
    );
  }

  @Get('cities')
  async getCities() {
    // Get unique cities from actual cars data in Supabase
    return this.carsService.getUniqueCities();
  }

  @Get('fuel-types')
  async getFuelTypes() {
    // Get unique fuel types from actual cars data in Supabase
    return this.carsService.getUniqueFuelTypes();
  }

  @Get('seats')
  async getSeats() {
    // Get unique seat counts from actual cars data in Supabase
    return this.carsService.getUniqueSeats();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.carsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @UseInterceptors(FilesInterceptor('images', 10))
  async update(
    @Param('id') id: string,
    @Body() updateCarDto: UpdateCarDto,
    @UploadedFiles() files?: Express.Multer.File[],
  ) {
    let newImageUrls: string[] = [];

    // Upload new images if provided
    if (files && files.length > 0) {
      try {
        console.log(`Uploading ${files.length} new images to Supabase...`);
        newImageUrls = await this.supabaseStorageService.uploadMultipleImages(files, 'cars');
        console.log('New images uploaded successfully to Supabase:', newImageUrls);
      } catch (error) {
        console.error('Supabase upload failed:', error);
        throw new Error(`Failed to upload new images: ${error.message}`);
      }
    }

    // Handle existing images
    let existingImages: string[] = [];
    if (updateCarDto.existingImages) {
      try {
        existingImages = JSON.parse(updateCarDto.existingImages as any);
      } catch (error) {
        console.error('Error parsing existing images:', error);
      }
    }

    // Get current car to find images that need to be deleted
    const currentCar = await this.carsService.findOne(id);
    if (currentCar && currentCar.images) {
      const currentImages = Array.isArray(currentCar.images) ? currentCar.images : [];
      const imagesToDelete = currentImages.filter((img: string) => !existingImages.includes(img));
      
      if (imagesToDelete.length > 0) {
        console.log(`Deleting ${imagesToDelete.length} images from Supabase...`);
        await this.supabaseStorageService.deleteMultipleImages(imagesToDelete);
      }
    }

    // Combine existing and new images
    const allImages = [...existingImages, ...newImageUrls];
    
    // Remove existingImages from DTO as it's not a car field
    const { existingImages: _, ...carData } = updateCarDto;
    
    return this.carsService.update(id, {
      ...carData,
      images: allImages.length > 0 ? allImages : undefined,
    });
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  remove(@Param('id') id: string) {
    return this.carsService.remove(id);
  }
}