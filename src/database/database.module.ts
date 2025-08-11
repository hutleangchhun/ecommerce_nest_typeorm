import { Module } from '@nestjs/common';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as entities from '../common/entities';
import { DatabaseService } from './database.service';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        const isDevelopment = configService.get('NODE_ENV') === 'development';
        const logging = ['error', 'warn', 'migration'];
        if (isDevelopment) {
          logging.push('query');
        }
        
        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST', '157.10.73.27'),
          port: parseInt(configService.get<string>('DB_PORT', '5432')),
          username: configService.get<string>('DB_USERNAME', 'postgres'),
          password: configService.get<string>('DB_PASSWORD', '1234'),
          database: configService.get<string>('DB_NAME', 'ecommerce_db'),
          entities: Object.values(entities),
          synchronize: configService.get('TYPEORM_SYNCHRONIZE', 'true') === 'true',
          logging: logging as any,
          migrations: ['dist/database/migrations/*{.ts,.js}'],
          migrationsRun: configService.get('TYPEORM_RUN_MIGRATIONS', 'false') === 'true',
          dropSchema: configService.get('TYPEORM_DROP_SCHEMA', 'false') === 'true',
          ssl: configService.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
        } as TypeOrmModuleOptions;
      },
      inject: [ConfigService],
    }),
  ],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}