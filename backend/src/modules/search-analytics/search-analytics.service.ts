import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { CreateSearchAnalyticsDto } from './dto/create-search-analytics.dto';

@Injectable()
export class SearchAnalyticsService {
  constructor(private databaseService: DatabaseService) {}

  async create(createSearchAnalyticsDto: CreateSearchAnalyticsDto, userIp?: string, userId?: string) {
    const data = {
      id: this.databaseService.generateId(),
      ...createSearchAnalyticsDto,
      user_ip: userIp,
      user_id: userId,
      created_at: this.databaseService.formatDate(new Date()),
      updated_at: this.databaseService.formatDate(new Date())
    };

    return this.databaseService.insert('search_analytics', data);
  }

  async findAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const [analytics, total] = await Promise.all([
      this.databaseService.select('search_analytics', '*', `order=created_at.desc&limit=${limit}&offset=${offset}`),
      this.databaseService.count('search_analytics'),
    ]);

    return {
      analytics,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getSearchStats() {
    try {
      const [analytics, totalSearches] = await Promise.all([
        this.databaseService.select('search_analytics', 'search_city,created_at'),
        this.databaseService.count('search_analytics'),
      ]);

      // Group by city
      const citySearches = analytics.reduce((acc: any, search: any) => {
        if (search.search_city) {
          acc[search.search_city] = (acc[search.search_city] || 0) + 1;
        }
        return acc;
      }, {});

      const topCities = Object.entries(citySearches)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 10)
        .map(([city, count]) => ({ city, count }));

      const recentSearches = analytics
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10);

      return {
        totalSearches,
        topCities,
        recentSearches,
      };
    } catch (error) {
      console.error('Search stats error:', error);
      return {
        totalSearches: 0,
        topCities: [],
        recentSearches: [],
      };
    }
  }
}