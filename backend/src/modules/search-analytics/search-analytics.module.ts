import { Module } from '@nestjs/common';
import { SearchAnalyticsService } from './search-analytics.service';
import { SearchAnalyticsController } from './search-analytics.controller';

@Module({
  providers: [SearchAnalyticsService],
  controllers: [SearchAnalyticsController],
})
export class SearchAnalyticsModule {}