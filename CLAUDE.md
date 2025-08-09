# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Essential Commands
- `npm run start:dev` - Start development server with watch mode
- `npm run build` - Build the application for production
- `npm run start:prod` - Start production server
- `npm run lint` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier
- `npm run test` - Run Jest unit tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:cov` - Run tests with coverage report
- `npm run test:e2e` - Run end-to-end tests

### Docker Commands
- `docker-compose up -d` - Start all services (PostgreSQL, API, pgAdmin)
- `docker-compose down` - Stop all services
- API available at http://localhost:3000
- Swagger docs at http://localhost:3000/api/docs
- pgAdmin at http://localhost:8080 (admin@example.com / admin123)

## Architecture Overview

### Framework & Stack
- **NestJS** - Node.js framework with TypeScript and decorators
- **TypeORM** - ORM for PostgreSQL database interactions
- **PostgreSQL** - Primary database
- **Swagger/OpenAPI** - API documentation at `/api/docs`
- **Class Validator** - Request validation and transformation

### Module Structure
The application follows NestJS modular architecture with clear separation:

```
src/
├── app.module.ts           # Root module importing all feature modules
├── main.ts                 # Bootstrap file with CORS, validation, Swagger setup
├── database/               # Database configuration module
├── common/
│   ├── entities/           # TypeORM entities (Category, Product, Customer, Order, OrderItem)
│   └── dto/               # Data transfer objects for validation
└── [feature-modules]/     # Categories, Products, Customers, Orders
    ├── *.controller.ts    # REST endpoints
    ├── *.service.ts       # Business logic
    └── *.module.ts        # Module definition
```

### Database Design
- **Categories** → **Products** (One-to-Many)
- **Customers** → **Orders** (One-to-Many) 
- **Orders** → **OrderItems** (One-to-Many)
- **Products** → **OrderItems** (One-to-Many)

All entities use snake_case for database column names but camelCase in TypeScript.

### API Structure
- Global prefix: `/api/v1`
- RESTful endpoints for each resource
- Comprehensive Swagger documentation with tags
- Request validation using class-validator DTOs
- CORS enabled for localhost:3000 and localhost:5173

### Key Configuration
- Environment variables configured via `.env` file
- TypeORM synchronization disabled (uses existing schema)
- Database logging enabled in development mode
- Global validation pipe with transformation and whitelist validation

### Database Auto-Creation
- **TypeORM Synchronization**: Automatically creates tables and fields from entities
- **Database Service**: Auto-creates database if it doesn't exist
- **Initial Data Seeding**: Populates database with sample data
- **Health Checks**: Available at `/api/v1/health` and `/api/v1/health/database`
- **Migration Support**: Manual migrations available via npm scripts

### Environment Configuration
- `TYPEORM_SYNCHRONIZE=true` - Auto-create/update database schema
- `DB_SEED_DATA=true` - Populate with initial sample data
- `TYPEORM_RUN_MIGRATIONS=false` - Run migrations on startup
- `TYPEORM_DROP_SCHEMA=false` - Drop existing schema before sync

### Migration Commands
- `npm run migration:generate -- src/database/migrations/MigrationName` - Generate migration
- `npm run migration:run` - Run pending migrations
- `npm run migration:revert` - Revert last migration
- `npm run schema:sync` - Sync schema manually
- `npm run schema:drop` - Drop all schema

### Development Notes
- Database automatically created on first startup
- No manual schema setup required
- Sample data includes categories and products
- Entities export through common/entities/index.ts barrel pattern

## CI/CD Pipeline

### GitHub Actions Workflows

#### CI Pipeline (`.github/workflows/ci.yml`)
- **Triggers**: Push/PR to main/develop branches
- **Jobs**:
  - **Test**: Multi-Node.js version testing (18.x, 20.x) with PostgreSQL service
  - **E2E Test**: End-to-end testing with database
  - **Security Scan**: npm audit + Snyk vulnerability scanning
- **Features**:
  - Linting and code formatting checks
  - Unit tests with coverage reporting (Codecov integration)
  - Build verification
  - Health checks

#### CD Pipeline (`.github/workflows/cd.yml`)
- **Triggers**: Successful CI completion on main branch
- **Environments**: Staging → Production (with manual approval)
- **Features**:
  - AWS credentials configuration
  - Health checks post-deployment
  - Slack notifications for deployment status
  - Manual approval gate for production

#### Docker Build (`.github/workflows/docker-build.yml`)
- **Triggers**: Push to main/develop, tags, PRs
- **Features**:
  - Multi-platform builds (linux/amd64, linux/arm64)
  - GitHub Container Registry (ghcr.io)
  - Trivy security scanning
  - Build caching with GitHub Actions cache

### Deployment Configurations

#### Kubernetes (`k8s/`)
- **Namespace**: ecommerce-api
- **ConfigMap**: Environment-specific configuration
- **Secrets**: Base64 encoded sensitive data (DB credentials, JWT)
- **Deployment**: 3 replicas with resource limits and health probes
- **Service**: ClusterIP for internal communication
- **Ingress**: NGINX with TLS termination via cert-manager

#### Docker Compose
- **Development**: `docker-compose.yml` (with pgAdmin)
- **Production**: `docker-compose.prod.yml` (with Nginx reverse proxy)

### Required Secrets & Variables

#### Repository Secrets
- `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` - AWS deployment credentials
- `SNYK_TOKEN` - Snyk security scanning
- `SLACK_WEBHOOK` - Deployment notifications

#### Environment Variables
- `AWS_REGION` - AWS deployment region
- `STAGING_API_URL` / `PRODUCTION_API_URL` - Health check endpoints
- `PRODUCTION_APPROVERS` - GitHub usernames for production approval

### Setup Instructions
1. Copy `.env.example` to `.env` and configure
2. Update Kubernetes manifests with your domain/image registry
3. Configure GitHub repository secrets
4. Update Docker image references in deployment files
5. Set up AWS/cloud infrastructure for deployment targets