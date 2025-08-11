import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalysisController } from './analysis.controller';
import { AnalysisService } from './analysis.service';
import { Category, Customer, Product, Order, OrderItem } from '../common/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([Category, Customer, Product, Order, OrderItem]),
  ],
  controllers: [AnalysisController],
  providers: [AnalysisService],
  exports: [AnalysisService],
})
export class AnalysisModule {}