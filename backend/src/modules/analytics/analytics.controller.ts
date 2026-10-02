import { Controller, Get, Query } from '@nestjs/common'
import { AnalyticsService } from './analytics.service'

@Controller('analytics')
// Temporarily disabled auth guards for testing
// @UseGuards(JwtAuthGuard, AdminGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('overview')
  async getOverview() {
    return this.analyticsService.getOverview()
  }

  @Get('bookings')
  async getBookingsAnalytics(@Query('period') period?: string) {
    return this.analyticsService.getBookingsAnalytics(period)
  }

  @Get('revenue')
  async getRevenueAnalytics(@Query('period') period?: string) {
    return this.analyticsService.getRevenueAnalytics(period)
  }

  @Get('cars')
  async getCarsAnalytics() {
    return this.analyticsService.getCarsAnalytics()
  }

  @Get('users')
  async getUsersAnalytics(@Query('period') period?: string) {
    return this.analyticsService.getUsersAnalytics(period)
  }

  @Get('popular-cars')
  async getPopularCars() {
    return this.analyticsService.getPopularCars()
  }

  @Get('search-trends')
  async getSearchTrends() {
    return this.analyticsService.getSearchTrends()
  }

  @Get('geographic')
  async getGeographicData() {
    return this.analyticsService.getGeographicData()
  }
}