import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DatabaseService } from '../database/database.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  async getHealth() {
    const dbHealth = await this.databaseService.getHealthStatus();
    
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'ecommerce-api',
      version: '1.0.0',
      database: dbHealth,
    };
  }

  @Get('database')
  @ApiOperation({ summary: 'Database information' })
  @ApiResponse({ status: 200, description: 'Database information retrieved' })
  async getDatabaseInfo() {
    return await this.databaseService.getDatabaseInfo();
  }
}