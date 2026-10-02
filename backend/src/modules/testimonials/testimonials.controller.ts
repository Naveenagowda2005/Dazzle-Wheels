import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { TestimonialsService } from './testimonials.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('testimonials')
export class TestimonialsController {
  constructor(private readonly testimonialsService: TestimonialsService) {}

  @Get()
  findAll(@Query('limit') limit?: string) {
    return this.testimonialsService.findAll(limit ? parseInt(limit) : 6);
  }

  @Get('featured')
  getFeatured(@Query('limit') limit?: string) {
    return this.testimonialsService.findFeatured(limit ? parseInt(limit) : 3);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() body: { bookingId: string; rating: number; review: string }, @Request() req: any) {
    return this.testimonialsService.createFromBooking(body.bookingId, req.user.userId, body.rating, body.review);
  }
}