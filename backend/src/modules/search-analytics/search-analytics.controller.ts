import { Controller, Get, Post, Body, Query, UseGuards, Request, Ip } from '@nestjs/common';
import { SearchAnalyticsService } from './search-analytics.service';
import { CreateSearchAnalyticsDto } from './dto/create-search-analytics.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('search-analytics')
export class SearchAnalyticsController {
  constructor(private readonly searchAnalyticsService: SearchAnalyticsService) {}

  @Post()
  create(
    @Body() createSearchAnalyticsDto: CreateSearchAnalyticsDto,
    @Ip() ip: string,
    @Request() req?,
  ) {
    const userId = req?.user?.userId;
    return this.searchAnalyticsService.create(createSearchAnalyticsDto, ip, userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, AdminGuard)
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.searchAnalyticsService.findAll(
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
    );
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, AdminGuard)
  getStats() {
    return this.searchAnalyticsService.getSearchStats();
  }
}