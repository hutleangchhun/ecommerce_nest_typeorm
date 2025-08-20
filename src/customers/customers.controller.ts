import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from '../common/dto/create-customer.dto';
import { Customer } from '../common/entities/customer.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('customers')
@Controller('customers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new customer' })
  @ApiResponse({
    status: 201,
    description: 'The customer has been successfully created.',
    type: Customer,
  })
  create(@Body() createCustomerDto: CreateCustomerDto): Promise<Customer> {
    return this.customersService.create(createCustomerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all customers' })
  @ApiResponse({
    status: 200,
    description: 'Return all customers with their orders.',
    type: [Customer],
  })
  findAll(): Promise<Customer[]> {
    return this.customersService.findAll();
  }

  @Get('search')
  @ApiOperation({ summary: 'Search customers by name' })
  @ApiQuery({ name: 'name', description: 'Customer name to search for' })
  @ApiResponse({
    status: 200,
    description: 'Return customers matching the search term.',
    type: [Customer],
  })
  searchByName(@Query('name') name: string): Promise<Customer[]> {
    return this.customersService.searchByName(name);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get customer statistics' })
  @ApiResponse({
    status: 200,
    description: 'Return customer statistics including order counts.',
  })
  getCustomerStats(): Promise<any[]> {
    return this.customersService.getCustomerStats();
  }

  @Get('email/:email')
  @ApiOperation({ summary: 'Get a customer by email' })
  @ApiParam({ name: 'email', description: 'Customer email' })
  @ApiResponse({
    status: 200,
    description: 'Return the customer.',
    type: Customer,
  })
  @ApiResponse({ status: 404, description: 'Customer not found.' })
  findByEmail(@Param('email') email: string): Promise<Customer> {
    return this.customersService.findByEmail(email);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a customer by ID' })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiResponse({
    status: 200,
    description: 'Return the customer.',
    type: Customer,
  })
  @ApiResponse({ status: 404, description: 'Customer not found.' })
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Customer> {
    return this.customersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a customer' })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiResponse({
    status: 200,
    description: 'The customer has been successfully updated.',
    type: Customer,
  })
  @ApiResponse({ status: 404, description: 'Customer not found.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCustomerDto: Partial<CreateCustomerDto>,
  ): Promise<Customer> {
    return this.customersService.update(id, updateCustomerDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a customer' })
  @ApiParam({ name: 'id', description: 'Customer ID' })
  @ApiResponse({
    status: 200,
    description: 'The customer has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'Customer not found.' })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.customersService.remove(id);
  }
}