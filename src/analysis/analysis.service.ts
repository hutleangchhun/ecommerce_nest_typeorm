import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category, Customer, Product, Order, OrderItem } from '../common/entities';

@Injectable()
export class AnalysisService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
  ) {}

  async getDatabaseOverview() {
    const [
      totalCategories,
      totalProducts,
      totalCustomers,
      totalOrders,
      totalOrderItems,
    ] = await Promise.all([
      this.categoryRepository.count(),
      this.productRepository.count(),
      this.customerRepository.count(),
      this.orderRepository.count(),
      this.orderItemRepository.count(),
    ]);

    return {
      overview: {
        totalCategories,
        totalProducts,
        totalCustomers,
        totalOrders,
        totalOrderItems,
      },
      timestamp: new Date().toISOString(),
    };
  }

  async getInventoryAnalysis() {
    const products = await this.productRepository
      .createQueryBuilder('product')
      .leftJoin('product.category', 'category')
      .select([
        'product.product_id',
        'product.product_name',
        'product.price',
        'product.stock_quantity',
        'category.category_name',
      ])
      .getMany();

    const lowStockProducts = products.filter((p) => p.stock_quantity < 10);
    const outOfStockProducts = products.filter((p) => p.stock_quantity === 0);
    const highValueProducts = products.filter((p) => p.price > 100);

    const stockSummary = {
      totalProducts: products.length,
      averageStock: products.reduce((sum, p) => sum + p.stock_quantity, 0) / products.length,
      totalStockValue: products.reduce((sum, p) => sum + (p.price * p.stock_quantity), 0),
      lowStockCount: lowStockProducts.length,
      outOfStockCount: outOfStockProducts.length,
      highValueCount: highValueProducts.length,
    };

    const categoryStockAnalysis = await this.categoryRepository
      .createQueryBuilder('category')
      .leftJoin('category.products', 'product')
      .select([
        'category.category_name as category_name',
        'COUNT(product.product_id) as productCount',
        'COALESCE(SUM(product.stock_quantity), 0) as totalStock',
        'COALESCE(AVG(product.price), 0) as averagePrice',
      ])
      .groupBy('category.category_id')
      .addGroupBy('category.category_name')
      .getRawMany();

    return {
      stockSummary,
      categoryAnalysis: categoryStockAnalysis,
      alerts: {
        lowStockProducts: lowStockProducts.map(p => ({
          id: p.product_id,
          name: p.product_name,
          stock: p.stock_quantity,
          category: p.category?.category_name,
        })),
        outOfStockProducts: outOfStockProducts.map(p => ({
          id: p.product_id,
          name: p.product_name,
          category: p.category?.category_name,
        })),
      },
      timestamp: new Date().toISOString(),
    };
  }

  async getSalesAnalysis() {
    const ordersWithItems = await this.orderRepository
      .createQueryBuilder('order')
      .leftJoin('order.orderItems', 'orderItem')
      .leftJoin('orderItem.product', 'product')
      .leftJoin('order.customer', 'customer')
      .select([
        'order.order_id',
        'order.order_date',
        'order.status',
        'order.total_amount',
        'customer.first_name',
        'customer.last_name',
        'customer.email',
        'orderItem.quantity',
        'orderItem.price',
        'product.product_name',
        'product.product_id',
      ])
      .getMany();

    const totalRevenue = ordersWithItems.reduce((sum, order) => sum + order.total_amount, 0);
    const averageOrderValue = totalRevenue / ordersWithItems.length || 0;

    // Sales by status
    const salesByStatus = await this.orderRepository
      .createQueryBuilder('order')
      .select([
        'order.status',
        'COUNT(order.order_id) as orderCount',
        'COALESCE(SUM(order.total_amount), 0) as totalRevenue',
      ])
      .groupBy('order.status')
      .getRawMany();

    // Best selling products
    const bestSellingProducts = await this.orderItemRepository
      .createQueryBuilder('orderItem')
      .leftJoin('orderItem.product', 'product')
      .select([
        'product.product_id',
        'product.product_name',
        'SUM(orderItem.quantity) as totalSold',
        'AVG(orderItem.price) as averagePrice',
        'SUM(orderItem.quantity * orderItem.price) as totalRevenue',
      ])
      .groupBy('product.product_id')
      .addGroupBy('product.product_name')
      .orderBy('SUM(orderItem.quantity)', 'DESC')
      .limit(10)
      .getRawMany();

    // Customer analysis
    const customerOrderStats = await this.orderRepository
      .createQueryBuilder('order')
      .leftJoin('order.customer', 'customer')
      .select([
        'customer.customer_id',
        'customer.first_name',
        'customer.last_name',
        'customer.email',
        'COUNT(order.order_id) as totalOrders',
        'COALESCE(SUM(order.total_amount), 0) as totalSpent',
        'COALESCE(AVG(order.total_amount), 0) as averageOrderValue',
      ])
      .groupBy('customer.customer_id')
      .addGroupBy('customer.first_name')
      .addGroupBy('customer.last_name')
      .addGroupBy('customer.email')
      .orderBy('SUM(order.total_amount)', 'DESC')
      .limit(10)
      .getRawMany();

    return {
      summary: {
        totalOrders: ordersWithItems.length,
        totalRevenue,
        averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      },
      salesByStatus,
      topCustomers: customerOrderStats,
      bestSellingProducts: bestSellingProducts.map(item => ({
        productId: item.product_id,
        productName: item.product_name,
        totalSold: parseInt(item.totalSold),
        averagePrice: Math.round(parseFloat(item.averagePrice) * 100) / 100,
        totalRevenue: Math.round(parseFloat(item.totalRevenue) * 100) / 100,
      })),
      timestamp: new Date().toISOString(),
    };
  }

  async getDataQualityReport() {
    const [
      productsWithoutCategory,
      productsWithZeroPrice,
      productsWithNegativeStock,
      customersWithIncompleteData,
      ordersWithoutItems,
    ] = await Promise.all([
      // Products without category
      this.productRepository.count({ where: { category: null } }),
      
      // Products with zero price
      this.productRepository
        .createQueryBuilder('product')
        .where('product.price <= 0')
        .getCount(),

      // Products with negative stock
      this.productRepository
        .createQueryBuilder('product')
        .where('product.stock_quantity < 0')
        .getCount(),

      // Customers with incomplete data
      this.customerRepository
        .createQueryBuilder('customer')
        .where('customer.first_name IS NULL OR customer.last_name IS NULL OR customer.email IS NULL')
        .orWhere("customer.first_name = '' OR customer.last_name = '' OR customer.email = ''")
        .getCount(),

      // Orders without items
      this.orderRepository
        .createQueryBuilder('order')
        .leftJoin('order.orderItems', 'orderItem')
        .where('orderItem.order_item_id IS NULL')
        .getCount(),
    ]);

    const dataQualityScore = this.calculateDataQualityScore({
      productsWithoutCategory,
      productsWithZeroPrice,
      productsWithNegativeStock,
      customersWithIncompleteData,
      ordersWithoutItems,
    });

    return {
      qualityMetrics: {
        productsWithoutCategory,
        productsWithZeroPrice,
        productsWithNegativeStock,
        customersWithIncompleteData,
        ordersWithoutItems,
      },
      dataQualityScore,
      recommendations: this.getDataQualityRecommendations({
        productsWithoutCategory,
        productsWithZeroPrice,
        productsWithNegativeStock,
        customersWithIncompleteData,
        ordersWithoutItems,
      }),
      timestamp: new Date().toISOString(),
    };
  }

  private calculateDataQualityScore(metrics: any): number {
    const issues = Object.values(metrics).reduce((sum: number, count: any) => sum + Number(count), 0) as number;
    const maxScore = 100;
    const penaltyPerIssue = 5;
    
    const score = Math.max(0, maxScore - (issues * penaltyPerIssue));
    return Math.round(score);
  }

  private getDataQualityRecommendations(metrics: any): string[] {
    const recommendations = [];
    
    if (metrics.productsWithoutCategory > 0) {
      recommendations.push(`Assign categories to ${metrics.productsWithoutCategory} products`);
    }
    if (metrics.productsWithZeroPrice > 0) {
      recommendations.push(`Update pricing for ${metrics.productsWithZeroPrice} products`);
    }
    if (metrics.productsWithNegativeStock > 0) {
      recommendations.push(`Fix negative stock for ${metrics.productsWithNegativeStock} products`);
    }
    if (metrics.customersWithIncompleteData > 0) {
      recommendations.push(`Complete customer data for ${metrics.customersWithIncompleteData} customers`);
    }
    if (metrics.ordersWithoutItems > 0) {
      recommendations.push(`Review ${metrics.ordersWithoutItems} orders without items`);
    }

    if (recommendations.length === 0) {
      recommendations.push('Data quality looks good! Continue monitoring regularly.');
    }

    return recommendations;
  }

  async getFullSystemAnalysis() {
    const [overview, inventory, sales, quality] = await Promise.all([
      this.getDatabaseOverview(),
      this.getInventoryAnalysis(),
      this.getSalesAnalysis(),
      this.getDataQualityReport(),
    ]);

    return {
      systemHealth: {
        dataQualityScore: quality.dataQualityScore,
        totalRecords: overview.overview.totalCategories + 
                     overview.overview.totalProducts + 
                     overview.overview.totalCustomers + 
                     overview.overview.totalOrders,
        inventoryHealth: inventory.stockSummary.outOfStockCount === 0 ? 'Good' : 'Needs attention',
        salesPerformance: sales.summary.totalRevenue > 0 ? 'Active' : 'No sales data',
      },
      overview: overview.overview,
      inventory: {
        stockSummary: inventory.stockSummary,
        alerts: inventory.alerts,
      },
      sales: sales.summary,
      dataQuality: quality,
      timestamp: new Date().toISOString(),
    };
  }
}