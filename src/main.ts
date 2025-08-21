import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:3000', 'http://localhost:5173', 'http://157.10.73.27'];

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // API prefix
  app.setGlobalPrefix('api/v1');

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('E-commerce API')
    .setDescription(`
      A comprehensive e-commerce API built with NestJS and TypeORM with Role-Based Authentication.
      
      ## Authentication
      This API uses JWT Bearer tokens for authentication. To access protected endpoints:
      1. Register a new user via POST /auth/register
      2. Login via POST /auth/login to get your JWT token
      3. Click the "Authorize" button below and enter your token
      4. All subsequent requests will include the authorization header
      
      ## User Roles
      - **ADMIN**: Full access to all resources and user management
      - **SALES**: Manage products, categories, orders, and view analytics  
      - **CUSTOMER**: View products, manage own profile and orders only
      
      ## Quick Start
      1. Register as admin: {"name":"Admin","email":"admin@test.com","password":"admin123","role":"admin"}
      2. Login to get JWT token
      3. Use "Authorize" button to set token for all requests
    `)
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This name here is important for matching up with @ApiBearerAuth() in your controller!
    )
    .addTag('app', 'Application status endpoints')
    .addTag('auth', 'Authentication and authorization endpoints')
    .addTag('categories', 'Category management endpoints (Admin/Sales: Full, Customer: View only)')
    .addTag('products', 'Product management endpoints (Admin/Sales: Full, Customer: View only)')
    .addTag('customers', 'Customer management endpoints (Admin/Sales: Full, Customer: Own data only)')
    .addTag('orders', 'Order management endpoints (Admin/Sales: Full, Customer: Own orders only)')
    .addTag('analysis', 'Analytics and reporting endpoints (Admin/Sales only)')
    .addTag('health', 'Health check endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
      docExpansion: 'none',
      filter: true,
      showRequestHeaders: true,
    },
    customSiteTitle: 'E-commerce API Documentation',
    customfavIcon: '/favicon.ico',
    customJs: [
      'https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-bundle.js',
    ],
    customCssUrl: [
      'https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui.css',
    ],
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
}

bootstrap();