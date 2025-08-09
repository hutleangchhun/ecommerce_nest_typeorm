import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../common/entities/order.entity';
import { OrderItem } from '../common/entities/order-item.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
  ) {}

  async findAll(): Promise<Order[]> {
    return await this.ordersRepository.find({
      relations: ['customer', 'orderItems', 'orderItems.product'],
      order: { order_date: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { order_id: id },
      relations: ['customer', 'orderItems', 'orderItems.product', 'orderItems.product.category'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async findByCustomer(customerId: number): Promise<Order[]> {
    return await this.ordersRepository.find({
      where: { customer_id: customerId },
      relations: ['orderItems', 'orderItems.product'],
      order: { order_date: 'DESC' },
    });
  }

  async findByStatus(status: string): Promise<Order[]> {
    return await this.ordersRepository.find({
      where: { status },
      relations: ['customer', 'orderItems', 'orderItems.product'],
      order: { order_date: 'DESC' },
    });
  }

  async updateStatus(id: number, status: string): Promise<Order> {
    const order = await this.findOne(id);
    order.status = status;
    return await this.ordersRepository.save(order);
  }

  async getOrderSummary(): Promise<any> {
    const summary = await this.ordersRepository
      .createQueryBuilder('order')
      .select('order.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(order.total_amount)', 'total_amount')
      .groupBy('order.status')
      .getRawMany();

    const totalOrders = await this.ordersRepository.count();
    const totalRevenue = await this.ordersRepository
      .createQueryBuilder('order')
      .select('SUM(order.total_amount)', 'total')
      .getRawOne();

    return {
      totalOrders,
      totalRevenue: parseFloat(totalRevenue.total) || 0,
      statusBreakdown: summary.map(item => ({
        status: item.status,
        count: parseInt(item.count),
        totalAmount: parseFloat(item.total_amount) || 0,
      })),
    };
  }

  async getRecentOrders(limit: number = 10): Promise<Order[]> {
    return await this.ordersRepository.find({
      relations: ['customer', 'orderItems', 'orderItems.product'],
      order: { order_date: 'DESC' },
      take: limit,
    });
  }

  async getTopProducts(limit: number = 10): Promise<any[]> {
    return await this.orderItemsRepository
      .createQueryBuilder('orderItem')
      .leftJoinAndSelect('orderItem.product', 'product')
      .leftJoinAndSelect('product.category', 'category')
      .select('product.product_id', 'product_id')
      .addSelect('product.product_name', 'product_name')
      .addSelect('category.category_name', 'category_name')
      .addSelect('SUM(orderItem.quantity)', 'total_quantity')
      .addSelect('SUM(orderItem.total_price)', 'total_revenue')
      .groupBy('product.product_id, product.product_name, category.category_name')
      .orderBy('total_quantity', 'DESC')
      .limit(limit)
      .getRawMany();
  }
}