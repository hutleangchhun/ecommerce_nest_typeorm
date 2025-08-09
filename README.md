# E-commerce API

A comprehensive e-commerce REST API built with NestJS, TypeORM, and PostgreSQL. This API provides full CRUD operations for managing categories, products, customers, and orders.

## 🚀 Features

- **Categories Management** - Create, read, update, delete product categories
- **Products Management** - Full product lifecycle with inventory tracking
- **Customers Management** - Customer profiles and order history
- **Orders Management** - Order processing and status tracking
- **Database Relations** - Proper foreign key relationships
- **API Documentation** - Interactive Swagger/OpenAPI documentation
- **Data Validation** - Request validation with class-validator
- **Docker Support** - Complete containerization with Docker Compose

## 📋 API Endpoints

### Categories
- `GET /api/v1/categories` - Get all categories
- `GET /api/v1/categories/:id` - Get category by ID
- `GET /api/v1/categories/with-count` - Get categories with product count
- `POST /api/v1/categories` - Create new category
- `PATCH /api/v1/categories/:id` - Update category
- `DELETE /api/v1/categories/:id` - Delete category

### Products
- `GET /api/v1/products` - Get all products (with optional category filter)
- `GET /api/v1/products/:id` - Get product by ID
- `GET /api/v1/products/search?name=query` - Search products by name
- `GET /api/v1/products/low-stock?threshold=10` - Get low stock products
- `POST /api/v1/products` - Create new product
- `PATCH /api/v1/products/:id` - Update product
- `PATCH /api/v1/products/:id/stock` - Update product stock
- `DELETE /api/v1/products/:id` - Delete product

### Customers
- `GET /api/v1/customers` - Get all customers
- `GET /api/v1/customers/:id` - Get customer by ID
- `GET /api/v1/customers/email/:email` - Get customer by email
- `GET /api/v1/customers/search?name=query` - Search customers by name
- `GET /api/v1/customers/stats` - Get customer statistics
- `POST /api/v1/customers` - Create new customer
- `PATCH /api/v1/customers/:id` - Update customer
- `DELETE /api/v1/customers/:id` - Delete customer

### Orders
- `GET /api/v1/orders` - Get all orders
- `GET /api/v1/orders/:id` - Get order by ID
- `GET /api/v1/orders/customer/:customerId` - Get orders by customer
- `GET /api/v1/orders/status/:status` - Get orders by status
- `GET /api/v1/orders/summary` - Get order statistics
- `GET /api/v1/orders/recent?limit=10` - Get recent orders
- `GET /api/v1/orders/top-products?limit=10` - Get top selling products
- `PATCH /api/v1/orders/:id/status` - Update order status

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- npm or yarn

### Local Development

1. **Clone the repository**
```bash
git clone <repository-url>
cd ecommerce-api
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. **Set up the database**
```bash
# Make sure PostgreSQL is running
# Create database 'ecommerce_db'
# Run the schema from the migrate folder
```

5. **Start the development server**
```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`
API documentation at `http://localhost:3000/api/docs`

### Docker Setup

1. **Run with Docker Compose**
```bash
docker-compose up -d
```

This will start:
- PostgreSQL database on port 5432
- NestJS API on port 3000
- pgAdmin on port 8080

2. **Access the services**
- API: `http://localhost:3000`
- API Docs: `http://localhost:3000/api/docs`
- pgAdmin: `http://localhost:8080` (admin@example.com / admin123)

## 📊 Database Schema

The API uses the existing database schema with the following tables:
- `categories` - Product categories
- `customers` - Customer information
- `products` - Product catalog with category relationships
- `orders` - Customer orders
- `order_items` - Individual items within orders

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📝 API Documentation

Interactive API documentation is available at `/api/docs` when the server is running. This includes:
- All available endpoints
- Request/response schemas
- Try-it-out functionality
- Authentication details (when implemented)

## 🔧 Configuration

Environment variables:
- `DB_HOST` - Database host (default: localhost)
- `DB_PORT` - Database port (default: 5432)
- `DB_USERNAME` - Database username
- `DB_PASSWORD` - Database password
- `DB_NAME` - Database name
- `PORT` - Application port (default: 3000)
- `NODE_ENV` - Environment (development/production)

## 🚦 Development Scripts

- `npm run start` - Start production server
- `npm run start:dev` - Start development server with watch mode
- `npm run start:debug` - Start server in debug mode

- `npm run build` - Build the application
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## 📈 Performance Features

- **Database Indexing** - Optimized queries with proper indexes
- **Lazy Loading** - Efficient relationship loading
- **Query Builder** - Complex queries for analytics
- **Validation Pipes** - Request validation and transformation
- **CORS Support** - Cross-origin resource sharing enabled

## 🔮 Future Enhancements

- JWT Authentication & Authorization
- Rate Limiting
- Caching (Redis)
- File Upload for Product Images
- Email Notifications
- Payment Integration
- Advanced Search & Filtering
- Monitoring & Logging

## 📄 License

This project is licensed under the MIT License.