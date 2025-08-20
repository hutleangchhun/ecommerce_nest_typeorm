import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AnalysisService } from './analysis.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../common/enums/role.enum';

@ApiTags('analysis')
@Controller('analysis')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Get('overview')
  @Roles(Role.ADMIN, Role.SALES)
  @ApiOperation({ 
    summary: 'Get database overview',
    description: 'Returns count of all main entities in the system'
  })
  @ApiResponse({
    status: 200,
    description: 'Database overview retrieved successfully',
    schema: {
      example: {
        overview: {
          totalCategories: 5,
          totalProducts: 25,
          totalCustomers: 15,
          totalOrders: 8,
          totalOrderItems: 12
        },
        timestamp: '2024-01-01T00:00:00.000Z'
      }
    }
  })
  async getDatabaseOverview() {
    return await this.analysisService.getDatabaseOverview();
  }

  @Get('inventory')
  @Roles(Role.ADMIN, Role.SALES)
  @ApiOperation({ 
    summary: 'Get inventory analysis',
    description: 'Provides detailed inventory insights including stock levels, categories, and alerts'
  })
  @ApiResponse({
    status: 200,
    description: 'Inventory analysis retrieved successfully',
    schema: {
      example: {
        stockSummary: {
          totalProducts: 25,
          averageStock: 45.6,
          totalStockValue: 12500.50,
          lowStockCount: 3,
          outOfStockCount: 1,
          highValueCount: 5
        },
        categoryAnalysis: [
          {
            category_name: 'Electronics',
            productCount: '8',
            totalStock: '120',
            averagePrice: '299.99'
          }
        ],
        alerts: {
          lowStockProducts: [
            {
              id: 1,
              name: 'Product Name',
              stock: 5,
              category: 'Electronics'
            }
          ],
          outOfStockProducts: []
        }
      }
    }
  })
  async getInventoryAnalysis() {
    return await this.analysisService.getInventoryAnalysis();
  }

  @Get('sales')
  @Roles(Role.ADMIN, Role.SALES)
  @ApiOperation({ 
    summary: 'Get sales analysis',
    description: 'Provides comprehensive sales insights including revenue, top customers, and best-selling products'
  })
  @ApiResponse({
    status: 200,
    description: 'Sales analysis retrieved successfully',
    schema: {
      example: {
        summary: {
          totalOrders: 8,
          totalRevenue: 2450.75,
          averageOrderValue: 306.34
        },
        salesByStatus: [
          {
            order_status: 'completed',
            orderCount: '6',
            totalRevenue: '1950.50'
          }
        ],
        topCustomers: [
          {
            customer_id: 1,
            customer_firstName: 'John',
            customer_lastName: 'Doe',
            customer_email: 'john@example.com',
            totalOrders: '3',
            totalSpent: '850.25',
            averageOrderValue: '283.42'
          }
        ],
        bestSellingProducts: [
          {
            productId: 1,
            productName: 'Best Product',
            totalSold: 15,
            averagePrice: 99.99,
            totalRevenue: 1499.85
          }
        ]
      }
    }
  })
  async getSalesAnalysis() {
    return await this.analysisService.getSalesAnalysis();
  }

  @Get('data-quality')
  @Roles(Role.ADMIN, Role.SALES)
  @ApiOperation({ 
    summary: 'Get data quality report',
    description: 'Analyzes data integrity and provides quality score with recommendations'
  })
  @ApiResponse({
    status: 200,
    description: 'Data quality report retrieved successfully',
    schema: {
      example: {
        qualityMetrics: {
          productsWithoutCategory: 2,
          productsWithZeroPrice: 1,
          productsWithNegativeStock: 0,
          customersWithIncompleteData: 1,
          ordersWithoutItems: 0
        },
        dataQualityScore: 80,
        recommendations: [
          'Assign categories to 2 products',
          'Update pricing for 1 products',
          'Complete customer data for 1 customers'
        ]
      }
    }
  })
  async getDataQualityReport() {
    return await this.analysisService.getDataQualityReport();
  }

  @Get('system')
  @Roles(Role.ADMIN, Role.SALES)
  @ApiOperation({ 
    summary: 'Get full system analysis',
    description: 'Comprehensive system analysis combining all insights for monitoring dashboard'
  })
  @ApiResponse({
    status: 200,
    description: 'Full system analysis retrieved successfully',
    schema: {
      example: {
        systemHealth: {
          dataQualityScore: 85,
          totalRecords: 53,
          inventoryHealth: 'Good',
          salesPerformance: 'Active'
        },
        overview: {
          totalCategories: 5,
          totalProducts: 25,
          totalCustomers: 15,
          totalOrders: 8,
          totalOrderItems: 12
        },
        inventory: {
          stockSummary: {
            totalProducts: 25,
            averageStock: 45.6,
            totalStockValue: 12500.50
          },
          alerts: {
            lowStockProducts: [],
            outOfStockProducts: []
          }
        },
        sales: {
          totalOrders: 8,
          totalRevenue: 2450.75,
          averageOrderValue: 306.34
        },
        dataQuality: {
          dataQualityScore: 85,
          recommendations: []
        }
      }
    }
  })
  async getFullSystemAnalysis() {
    return await this.analysisService.getFullSystemAnalysis();
  }

  @Get('health-check')
  @Roles(Role.ADMIN, Role.SALES)
  @ApiOperation({ 
    summary: 'Quick system health check',
    description: 'Lightweight endpoint for monitoring system status'
  })
  @ApiResponse({
    status: 200,
    description: 'System health check completed',
    schema: {
      example: {
        status: 'healthy',
        checks: {
          database: 'connected',
          dataIntegrity: 'good',
          recordsCount: 53
        },
        timestamp: '2024-01-01T00:00:00.000Z'
      }
    }
  })
  async getHealthCheck() {
    const overview = await this.analysisService.getDatabaseOverview();
    const quality = await this.analysisService.getDataQualityReport();
    
    return {
      status: quality.dataQualityScore > 70 ? 'healthy' : 'needs-attention',
      checks: {
        database: 'connected',
        dataIntegrity: quality.dataQualityScore > 70 ? 'good' : 'issues-detected',
        recordsCount: Object.values(overview.overview).reduce((sum: number, count: number) => sum + count, 0),
        qualityScore: quality.dataQualityScore,
      },
      timestamp: new Date().toISOString(),
    };
  }
}