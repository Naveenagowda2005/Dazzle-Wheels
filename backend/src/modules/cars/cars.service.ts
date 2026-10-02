import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { SearchCarsDto } from './dto/search-cars.dto';
import { SupabaseStorageService } from '../supabase-storage/supabase-storage.service';

@Injectable()
export class CarsService {
  constructor(
    private databaseService: DatabaseService,
    private supabaseStorageService: SupabaseStorageService,
  ) {}

  async create(createCarDto: CreateCarDto) {
    const { images, ...otherData } = createCarDto;
    
    const data = {
      id: this.databaseService.generateId(),
      ...otherData,
      availability: otherData.availability ?? true,
      created_at: this.databaseService.formatDate(new Date()),
      updated_at: this.databaseService.formatDate(new Date())
    };

    const car = await this.databaseService.insert('cars', data);
    const carId = Array.isArray(car) ? car[0]?.id : car?.id;

    // Insert images into car_images table if provided
    if (images && images.length > 0 && carId) {
      for (let i = 0; i < images.length; i++) {
        await this.databaseService.insert('car_images', {
          id: this.databaseService.generateId(),
          car_id: carId,
          image_url: images[i],
          is_primary: i === 0,
          sort_order: i,
          created_at: this.databaseService.formatDate(new Date())
        });
      }
    }

    return this.mapCar(Array.isArray(car) ? car[0] : car, images || []);
  }

  private mapCar(car: any, images: string[] = []) {
    return {
      id: car.id,
      name: car.name,
      brand: car.brand,
      fuelType: car.fuel_type,
      seats: car.seats,
      pricePerHour: parseFloat(car.price_per_hour),
      pricePerDay: parseFloat(car.price_per_day),
      city: car.city,
      description: car.description,
      availability: car.availability,
      createdAt: car.created_at,
      updatedAt: car.updated_at,
      images,
    };
  }

  private async attachImages(cars: any[]): Promise<any[]> {
    if (cars.length === 0) return [];
    const ids = cars.map(c => c.id);
    const allImages = await this.databaseService.select(
      'car_images', 'car_id,image_url,is_primary,sort_order',
      `car_id=in.(${ids.join(',')})&order=sort_order.asc`
    );
    return cars.map(car => {
      const imgs = allImages.filter(img => img.car_id === car.id).map(img => img.image_url);
      return this.mapCar(car, imgs);
    });
  }

  async findAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const [cars, total] = await Promise.all([
      this.databaseService.select('cars', '*', `order=created_at.desc&limit=${limit}&offset=${offset}`),
      this.databaseService.count('cars'),
    ]);

    return {
      cars: await this.attachImages(cars),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const cars = await this.databaseService.select('cars', '*', `id=eq.${id}`);

    if (cars.length === 0) {
      throw new NotFoundException('Car not found');
    }

    const [carWithImages] = await this.attachImages(cars);
    return carWithImages;  }

  async update(id: string, updateCarDto: UpdateCarDto) {
    const cars = await this.databaseService.select('cars', 'id', `id=eq.${id}`);
    
    if (cars.length === 0) {
      throw new NotFoundException('Car not found');
    }

    const { images, ...otherData } = updateCarDto;
    const updatedData = {
      ...otherData,
      updated_at: this.databaseService.formatDate(new Date())
    };

    await this.databaseService.update('cars', updatedData, `id=eq.${id}`);

    // If new images provided, replace existing ones
    if (images && images.length > 0) {
      await this.databaseService.delete('car_images', `car_id=eq.${id}`);
      for (let i = 0; i < images.length; i++) {
        await this.databaseService.insert('car_images', {
          id: this.databaseService.generateId(),
          car_id: id,
          image_url: images[i],
          is_primary: i === 0,
          sort_order: i,
          created_at: this.databaseService.formatDate(new Date())
        });
      }
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    const cars = await this.databaseService.select('cars', 'id', `id=eq.${id}`);
    
    if (cars.length === 0) {
      throw new NotFoundException('Car not found');
    }

    // Get all bookings for this car
    const allBookings = await this.databaseService.select('bookings', 'id,booking_status', `car_id=eq.${id}`);
    
    // Block deletion only if there are pending or confirmed bookings
    const activeBookings = allBookings.filter((b: any) => b.booking_status === 'PENDING' || b.booking_status === 'CONFIRMED');
    if (activeBookings.length > 0) {
      await this.databaseService.update('cars', {
        availability: false,
        updated_at: this.databaseService.formatDate(new Date())
      }, `id=eq.${id}`);
      throw new ConflictException('Car has active bookings and cannot be deleted. It has been marked as unavailable instead.');
    }

    // Delete payments linked to bookings of this car first (FK constraint)
    for (const booking of allBookings) {
      await this.databaseService.delete('payments', `booking_id=eq.${booking.id}`);
    }

    // Then delete bookings, images, and finally the car
    await this.databaseService.delete('bookings', `car_id=eq.${id}`);
    await this.databaseService.delete('car_images', `car_id=eq.${id}`);
    return this.databaseService.delete('cars', `id=eq.${id}`);
  }

  async search(searchDto: SearchCarsDto) {
    let whereConditions = [];
    
    if (searchDto.city) {
      whereConditions.push(`city=ilike.*${searchDto.city}*`);
    }
    
    if (searchDto.fuelType) {
      whereConditions.push(`fuel_type=eq.${searchDto.fuelType}`);
    }
    
    if (searchDto.seats) {
      whereConditions.push(`seats=eq.${searchDto.seats}`);
    }
    
    if (searchDto.minPrice) {
      whereConditions.push(`price_per_day=gte.${searchDto.minPrice}`);
    }
    
    if (searchDto.maxPrice) {
      whereConditions.push(`price_per_day=lte.${searchDto.maxPrice}`);
    }

    // Always filter for available cars
    whereConditions.push('availability=eq.true');

    const whereClause = whereConditions.length > 0 ? whereConditions.join('&') : '';
    const page = parseInt(searchDto.page || '1');
    const limit = parseInt(searchDto.limit || '10');
    const offset = (page - 1) * limit;

    const [cars, total] = await Promise.all([
      this.databaseService.select('cars', '*', `${whereClause}&order=created_at.desc&limit=${limit}&offset=${offset}`),
      this.databaseService.count('cars', whereClause),
    ]);

    return {
      cars: await this.attachImages(cars),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findAvailable() {
    const cars = await this.databaseService.select('cars', '*', 'availability=eq.true&order=created_at.desc');
    return this.attachImages(cars);
  }

  async findFeatured(limit = 6) {
    const cars = await this.databaseService.select('cars', '*', `availability=eq.true&order=created_at.desc&limit=${limit}`);
    return this.attachImages(cars);
  }

  async updateAvailability(id: string, availability: boolean) {
    const cars = await this.databaseService.select('cars', 'id', `id=eq.${id}`);
    
    if (cars.length === 0) {
      throw new NotFoundException('Car not found');
    }

    const updatedData = {
      availability,
      updated_at: this.databaseService.formatDate(new Date())
    };

    return this.databaseService.update('cars', updatedData, `id=eq.${id}`);
  }

  async getUniqueCities() {
    // Get all unique cities from cars table
    const cars = await this.databaseService.select('cars', 'city', '');
    
    // Extract unique cities and filter out null/empty values
    const uniqueCities = [...new Set(cars.map(car => car.city).filter(city => city && city.trim()))]
      .sort(); // Sort alphabetically
    
    return uniqueCities;
  }

  async getUniqueFuelTypes() {
    // Get all unique fuel types from cars table
    const cars = await this.databaseService.select('cars', 'fuel_type', '');
    
    // Extract unique fuel types and filter out null/empty values
    const uniqueFuelTypes = [...new Set(cars.map(car => car.fuel_type).filter(fuelType => fuelType && fuelType.trim()))]
      .sort(); // Sort alphabetically
    
    return uniqueFuelTypes;
  }

  async getUniqueSeats() {
    // Get all unique seat counts from cars table
    const cars = await this.databaseService.select('cars', 'seats', '');
    
    // Extract unique seat counts and filter out null values
    const uniqueSeats = [...new Set(cars.map(car => car.seats).filter(seats => seats !== null && seats !== undefined))]
      .sort((a, b) => a - b); // Sort numerically
    
    return uniqueSeats;
  }
}