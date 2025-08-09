import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.initializeDatabase();
  }

  private async initializeDatabase() {
    try {
      // Check if database exists and create if not
      await this.ensureDatabaseExists();
      
      // Log database connection status
      this.logger.log(`Database connected: ${this.dataSource.options.database}`);
      
      // Run synchronization if enabled
      if (this.configService.get('TYPEORM_SYNCHRONIZE', 'true') === 'true') {
        this.logger.log('TypeORM synchronization enabled - tables will be auto-created');
      }
      
      // Seed initial data if needed
      if (this.configService.get('DB_SEED_DATA', 'false') === 'true') {
        await this.seedInitialData();
      }
      
    } catch (error) {
      this.logger.error('Failed to initialize database:', error.message);
      throw error;
    }
  }

  private async ensureDatabaseExists() {
    const dbName = this.configService.get('DB_NAME');
    
    // Create a connection without specifying database to check if it exists
    const tempDataSource = new DataSource({
      type: 'postgres',
      host: this.configService.get('DB_HOST'),
      port: this.configService.get('DB_PORT'),
      username: this.configService.get('DB_USERNAME'),
      password: this.configService.get('DB_PASSWORD'),
      database: 'postgres', // Connect to default postgres database
    });

    try {
      await tempDataSource.initialize();
      
      // Check if our target database exists
      const result = await tempDataSource.query(
        'SELECT 1 FROM pg_database WHERE datname = $1',
        [dbName]
      );

      if (result.length === 0) {
        this.logger.log(`Creating database: ${dbName}`);
        await tempDataSource.query(`CREATE DATABASE "${dbName}"`);
        this.logger.log(`Database ${dbName} created successfully`);
      } else {
        this.logger.log(`Database ${dbName} already exists`);
      }

      await tempDataSource.destroy();
    } catch (error) {
      this.logger.error('Error ensuring database exists:', error.message);
      await tempDataSource.destroy();
      throw error;
    }
  }

  private async seedInitialData() {
    try {
      this.logger.log('Seeding initial data...');
      
      // Check if data already exists
      const categoryCount = await this.dataSource.query('SELECT COUNT(*) FROM categories');
      if (parseInt(categoryCount[0].count) > 0) {
        this.logger.log('Data already exists, skipping seed');
        return;
      }

      // Insert initial categories
      await this.dataSource.query(`
        INSERT INTO categories (category_name, description, created_at) VALUES
        ('Electronics', 'Electronic devices and accessories', NOW()),
        ('Clothing', 'Apparel and fashion items', NOW()),
        ('Books', 'Books and publications', NOW()),
        ('Home & Garden', 'Home improvement and gardening items', NOW()),
        ('Sports', 'Sports equipment and accessories', NOW())
        ON CONFLICT (category_name) DO NOTHING
      `);

      // Insert initial products
      await this.dataSource.query(`
        INSERT INTO products (product_name, category_id, price, stock_quantity, description, sku, created_at, updated_at) VALUES
        ('Smartphone', 1, 599.99, 50, 'Latest smartphone with advanced features', 'PHONE001', NOW(), NOW()),
        ('Laptop', 1, 999.99, 25, 'High-performance laptop for work and gaming', 'LAPTOP001', NOW(), NOW()),
        ('T-Shirt', 2, 19.99, 100, 'Comfortable cotton t-shirt', 'TSHIRT001', NOW(), NOW()),
        ('Jeans', 2, 49.99, 75, 'Classic denim jeans', 'JEANS001', NOW(), NOW()),
        ('Programming Book', 3, 29.99, 40, 'Learn programming fundamentals', 'BOOK001', NOW(), NOW())
        ON CONFLICT (sku) DO NOTHING
      `);

      this.logger.log('Initial data seeded successfully');
    } catch (error) {
      this.logger.error('Error seeding initial data:', error.message);
    }
  }

  async getHealthStatus() {
    try {
      await this.dataSource.query('SELECT 1');
      return {
        status: 'healthy',
        database: this.dataSource.options.database,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  async getDatabaseInfo() {
    try {
      const result = await this.dataSource.query(`
        SELECT 
          schemaname,
          tablename,
          tableowner
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY tablename
      `);
      
      const options = this.dataSource.options as any;
      return {
        tables: result,
        connection: {
          host: options.host,
          port: options.port,
          database: options.database,
        }
      };
    } catch (error) {
      this.logger.error('Error getting database info:', error.message);
      throw error;
    }
  }
}