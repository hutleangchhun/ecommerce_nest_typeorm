# Database Auto-Creation Setup Guide

This guide explains how TypeORM automatically creates and manages your database schema in the ecommerce API.

## 🚀 How It Works

Your backend now automatically:
1. **Creates the database** if it doesn't exist
2. **Creates all tables** from TypeORM entities
3. **Creates all fields** with proper types and constraints
4. **Sets up relationships** between tables
5. **Seeds initial data** for testing

## ⚙️ Configuration

### Environment Variables

Add these to your `.env` file:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=ecommerce_db

# TypeORM Auto-Creation Settings
TYPEORM_SYNCHRONIZE=true          # Auto-create/update schema
DB_SEED_DATA=true                 # Add sample data
TYPEORM_RUN_MIGRATIONS=false      # Use migrations instead of sync
TYPEORM_DROP_SCHEMA=false         # Drop schema before sync (dangerous!)
```

### Development vs Production

**Development** (`.env`):
```env
TYPEORM_SYNCHRONIZE=true
DB_SEED_DATA=true
```

**Production** (`.env.production`):
```env
TYPEORM_SYNCHRONIZE=false         # Use migrations in production
TYPEORM_RUN_MIGRATIONS=true       # Run migrations on startup
DB_SEED_DATA=false               # No sample data in production
```

## 🏗️ What Gets Created Automatically

### 1. Database Creation
- Creates PostgreSQL database if it doesn't exist
- No manual database creation needed

### 2. Tables Created
Based on your TypeORM entities:

- **categories** (category_id, category_name, description, created_at)
- **products** (product_id, product_name, category_id, price, stock_quantity, description, sku, created_at, updated_at)
- **customers** (customer_id, first_name, last_name, email, phone, address, etc.)
- **orders** (order_id, customer_id, order_date, status, total_amount, etc.)
- **order_items** (order_item_id, order_id, product_id, quantity, price, created_at)

### 3. Relationships
- Categories → Products (One-to-Many)
- Customers → Orders (One-to-Many)
- Orders → OrderItems (One-to-Many)
- Products → OrderItems (One-to-Many)

### 4. Sample Data
When `DB_SEED_DATA=true`:
- 5 initial categories (Electronics, Clothing, Books, Home & Garden, Sports)
- 5 sample products with proper category relationships

## 🛠️ Quick Start

### Option 1: Docker (Recommended)
```bash
# Start with auto-creation
docker-compose up -d

# Check logs to see database creation
docker-compose logs api
```

### Option 2: Local Development
```bash
# 1. Start PostgreSQL locally
# 2. Copy environment file
cp .env.example .env

# 3. Edit .env with your PostgreSQL credentials
nano .env

# 4. Start the application
npm run start:dev
```

### Option 3: Fresh Start
```bash
# Drop everything and recreate
TYPEORM_DROP_SCHEMA=true npm run start:dev
```

## 📋 Health Checks

Check if database is properly set up:

```bash
# Basic health check
curl http://localhost:3000/api/v1/health

# Database-specific info
curl http://localhost:3000/api/v1/health/database
```

## 🔄 Migration Support

For production environments, use migrations instead of synchronization:

### Generate Migration
```bash
# After changing entities
npm run migration:generate -- src/database/migrations/UpdateProductTable
```

### Run Migrations
```bash
npm run migration:run
```

### Revert Migration
```bash
npm run migration:revert
```

## 🎯 Adding New Fields

Simply update your TypeORM entities and restart:

```typescript
// src/common/entities/product.entity.ts
@Entity('products')
export class Product {
  // ... existing fields ...
  
  @Column({ type: 'varchar', length: 255, nullable: true })
  image_url: string;  // This field will be auto-created!
  
  @Column({ type: 'boolean', default: true })
  is_active: boolean; // This too!
}
```

Restart the app - new columns appear automatically!

## 🚨 Important Notes

### ⚠️ Synchronization Warnings
- **Development**: `TYPEORM_SYNCHRONIZE=true` is fine
- **Production**: Use `TYPEORM_SYNCHRONIZE=false` and migrations
- **Data Loss**: Synchronization can drop columns if removed from entities

### 🔒 Production Best Practices
```env
# Production settings
NODE_ENV=production
TYPEORM_SYNCHRONIZE=false
TYPEORM_RUN_MIGRATIONS=true
DB_SEED_DATA=false
```

### 🐛 Troubleshooting

**Database doesn't exist error:**
- Check PostgreSQL is running
- Verify DB credentials in `.env`
- Check logs: `docker-compose logs postgres`

**Tables not created:**
- Ensure `TYPEORM_SYNCHRONIZE=true`
- Check entity imports in `database.module.ts`
- Verify entities are properly decorated

**Connection refused:**
- Check DB_HOST (use 'postgres' for Docker, 'localhost' for local)
- Verify DB_PORT (usually 5432)
- Ensure PostgreSQL is accepting connections

## 📚 Logs and Monitoring

Monitor database operations:
```bash
# View app logs
docker-compose logs -f api

# View database logs  
docker-compose logs -f postgres

# Check running containers
docker-compose ps
```

The logs will show:
- Database creation
- Table synchronization
- Data seeding
- Health check results

Your backend is now fully automated for database setup! 🎉