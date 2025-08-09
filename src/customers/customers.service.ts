import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../common/entities/customer.entity';
import { CreateCustomerDto } from '../common/dto/create-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
  ) {}

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    const customer = this.customersRepository.create(createCustomerDto);
    return await this.customersRepository.save(customer);
  }

  async findAll(): Promise<Customer[]> {
    return await this.customersRepository.find({
      relations: ['orders'],
    });
  }

  async findOne(id: number): Promise<Customer> {
    const customer = await this.customersRepository.findOne({
      where: { customer_id: id },
      relations: ['orders', 'orders.orderItems'],
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return customer;
  }

  async findByEmail(email: string): Promise<Customer> {
    const customer = await this.customersRepository.findOne({
      where: { email },
      relations: ['orders'],
    });

    if (!customer) {
      throw new NotFoundException(`Customer with email ${email} not found`);
    }

    return customer;
  }

  async update(id: number, updateCustomerDto: Partial<CreateCustomerDto>): Promise<Customer> {
    const customer = await this.findOne(id);
    Object.assign(customer, updateCustomerDto);
    return await this.customersRepository.save(customer);
  }

  async remove(id: number): Promise<void> {
    const customer = await this.findOne(id);
    await this.customersRepository.remove(customer);
  }

  async getCustomerStats(): Promise<any[]> {
    return await this.customersRepository
      .createQueryBuilder('customer')
      .leftJoinAndSelect('customer.orders', 'orders')
      .loadRelationCountAndMap('customer.orderCount', 'customer.orders')
      .getMany();
  }

  async searchByName(name: string): Promise<Customer[]> {
    return await this.customersRepository
      .createQueryBuilder('customer')
      .where(
        'customer.first_name ILIKE :name OR customer.last_name ILIKE :name OR CONCAT(customer.first_name, \' \', customer.last_name) ILIKE :name',
        { name: `%${name}%` },
      )
      .getMany();
  }
}