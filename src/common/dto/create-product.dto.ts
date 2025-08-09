import { IsString, IsNotEmpty, IsNumber, IsOptional, IsPositive, Min, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    description: 'Product name',
    example: 'Wireless Bluetooth Headphones',
    maxLength: 200,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  product_name: string;

  @ApiProperty({
    description: 'Category ID',
    example: 1,
  })
  @IsNumber()
  @IsPositive()
  category_id: number;

  @ApiProperty({
    description: 'Product price',
    example: 99.99,
  })
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiProperty({
    description: 'Stock quantity',
    example: 50,
    default: 0,
  })
  @IsNumber()
  @Min(0)
  stock_quantity: number = 0;

  @ApiProperty({
    description: 'Product description',
    example: 'High-quality wireless Bluetooth headphones with noise cancellation',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Product SKU',
    example: 'WBH-001',
    maxLength: 50,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  sku: string;
}