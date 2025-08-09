import {
  Controller,
  Get,
  Patch,
  Param,
  ParseIntPipe,
  Query,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { Order } from '../common/entities/order.entity';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all orders' })
  @ApiResponse({
    status: 200,
    description: 'Return all orders with customer and order items.',
    type: [Order],
  })
  findAll(): Promise<Order[]> {
    return this.ordersService.findAll();
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get order summary statistics' })
  @ApiResponse({
    status: 200,
    description: 'Return order statistics by status and total revenue.',
  })
  getOrderSummary(): Promise<any> {
    return this.ordersService.getOrderSummary();
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recent orders' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of recent orders to return (default: 10)',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Return recent orders.',
    type: [Order],
  })
  getRecentOrders(@Query('limit') limit?: number): Promise<Order[]> {
    return this.ordersService.getRecentOrders(limit);
  }

  @Get('top-products')
  @ApiOperation({ summary: 'Get top selling products' })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of top products to return (default: 10)',
    type: Number,
  })
  @ApiResponse({
    status: 200,
    description: 'Return top selling products.',
  })
  getTopProducts(@Query('limit') limit?: number): Promise<any[]> {
    return this.ordersService.getTopProducts(limit);
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Get orders by status' })
  @ApiParam({ name: 'status', description: 'Order status' })
  @ApiResponse({
    status: 200,
    description: 'Return orders with the specified status.',
    type: [Order],
  })
  findByStatus(@Param('status') status: string): Promise<Order[]> {
    return this.ordersService.findByStatus(status);
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: 'Get orders by customer ID' })
  @ApiParam({ name: 'customerId', description: 'Customer ID' })
  @ApiResponse({
    status: 200,
    description: 'Return orders for the specified customer.',
    type: [Order],
  })
  findByCustomer(@Param('customerId', ParseIntPipe) customerId: number): Promise<Order[]> {
    return this.ordersService.findByCustomer(customerId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an order by ID' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the order.',
    type: Order,
  })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Order> {
    return this.ordersService.findOne(id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({
    status: 200,
    description: 'Order status updated successfully.',
    type: Order,
  })
  @ApiResponse({ status: 404, description: 'Order not found.' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
  ): Promise<Order> {
    return this.ordersService.updateStatus(id, status);
  }
}