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
- **Node.js Versions**: 18.x, 20.x, 22.x with PostgreSQL 15 service
- **Jobs**:
  - **Test**: Multi-Node.js version testing with enhanced caching
  - **E2E Test**: End-to-end testing with database integration
  - **Security Scan**: Comprehensive vulnerability scanning
- **Features**:
  - ESLint with auto-fix and Prettier formatting checks
  - Unit tests with coverage reporting (Codecov v4 integration)
  - SonarCloud static code analysis
  - npm audit with JSON output and artifact upload
  - Snyk vulnerability scanning with SARIF upload
  - Trivy filesystem vulnerability scanning
  - GitHub Code Scanning integration
  - Build verification with production-ready configuration

#### CD Pipeline - VPS Deployment (`.github/workflows/cd.yml`)
- **Triggers**: Successful CI completion on main branch + manual workflow dispatch
- **Environments**: Staging → Production (with manual approval)
- **Docker Registry**: Docker Hub (leangchhunhut/ecommerce-api)
- **Jobs**:
  - **Build Image**: Multi-platform Docker build with security scanning
  - **Deploy Staging**: Automated deployment to staging VPS
  - **Deploy Production**: Manual approval + production deployment
- **Features**:
  - Docker image build with multi-architecture support (linux/amd64, linux/arm64)
  - Trivy container vulnerability scanning
  - SSH-based VPS deployment via appleboy/ssh-action
  - Zero-downtime deployment with backup/rollback strategy
  - Comprehensive health checks (API, database, Swagger docs)
  - Rolling updates with container verification
  - Automated cleanup of old Docker images
  - Slack notifications for deployment status
  - Manual approval workflow for production deployments

#### Docker Build & Security (`.github/workflows/docker-build.yml`)
- **Triggers**: Push to main/develop, tags, PRs
- **Registries**: GitHub Container Registry (ghcr.io) + Docker Hub
- **Features**:
  - Multi-platform builds (linux/amd64, linux/arm64) with QEMU emulation
  - Enhanced build caching with scope-based strategies
  - SBOM (Software Bill of Materials) generation with Anchore
  - Provenance and attestation support
  - Multi-scanner security analysis (Trivy + Grype)
  - Cosign image signing for supply chain security
  - Container functionality testing
  - SARIF security report uploads to GitHub Security tab
  - Build artifact uploads for compliance

### VPS Deployment Configuration

#### VPS Setup (`scripts/vps-setup.sh`)
- **Deployment Directory**: `/opt/ecommerce-api`
- **System User**: `ecommerce` (added to docker group)
- **Required Services**: Docker, Docker Compose, Nginx, UFW firewall
- **Security Features**:
  - Custom SSH port configuration (default: 2222)
  - Key-only authentication (password auth disabled)
  - Root login disabled
  - UFW firewall with essential ports only (SSH, 80, 443, 3000)
- **Nginx Configuration**: Reverse proxy setup for API with health check support
- **Log Rotation**: Automated log management with 14-day retention

#### Docker Compose for VPS (`docker-compose.vps.yml`)
- **Production Configuration**: Optimized for VPS deployment
- **Image**: `leangchhunhut/ecommerce-api:latest` (from Docker Hub)
- **Database**: PostgreSQL 15-alpine with persistent volumes
- **Networking**: Internal Docker network with exposed API port
- **Health Checks**: Built-in container health monitoring
- **Environment**: Production-ready with proper resource limits

#### Legacy Configurations (Optional)
- **Kubernetes** (`k8s/`): Available for container orchestration environments
- **Development Docker Compose** (`docker-compose.yml`): Local development with pgAdmin

### Required Secrets & Variables

#### Repository Secrets (GitHub Settings → Secrets and variables → Actions)
**Docker Registry:**
- `DOCKERHUB_USERNAME` - Docker Hub username
- `DOCKERHUB_TOKEN` - Docker Hub access token/password

**VPS Deployment:**
- `VPS_SSH_KEY` - Private SSH key for VPS access (PEM format)
- `VPS_USER` - VPS username (default: `ecommerce`)
- `VPS_PORT` - SSH port (default: `22`, recommended: `2222`)
- `STAGING_VPS_HOST` - Staging VPS IP address or hostname
- `PRODUCTION_VPS_HOST` - Production VPS IP address or hostname

**Security & Quality:**
- `CODECOV_TOKEN` - Codecov integration token
- `SONAR_TOKEN` - SonarCloud authentication token
- `SNYK_TOKEN` - Snyk vulnerability scanning token

**Notifications:**
- `SLACK_WEBHOOK` - Slack webhook URL for deployment notifications

#### Repository Variables (GitHub Settings → Secrets and variables → Actions → Variables)
- `PRODUCTION_APPROVERS` - Comma-separated GitHub usernames for production approval

#### VPS Environment Variables (Configure in `/opt/ecommerce-api/.env`)
```bash
# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=your_db_user
DB_PASSWORD=your_secure_password
DB_NAME=ecommerce_prod

# Application Configuration
NODE_ENV=production
PORT=3000
JWT_SECRET=your_jwt_secret
API_PREFIX=api/v1

# TypeORM Configuration
TYPEORM_SYNCHRONIZE=false
TYPEORM_LOGGING=false
TYPEORM_RUN_MIGRATIONS=true
```

### Setup Instructions

#### 1. VPS Initial Setup
```bash
# On your VPS, run the setup script
chmod +x scripts/vps-setup.sh
SSH_PORT=2222 ./scripts/vps-setup.sh
```

#### 2. Configure GitHub Repository
1. Add all required secrets and variables in GitHub repository settings
2. Ensure your SSH public key is added to the VPS `ecommerce` user
3. Update VPS hostnames/IPs in repository secrets
4. Configure production approvers list

#### 3. Docker Compose VPS Configuration
Create `docker-compose.vps.yml` on your VPS with production settings:
- PostgreSQL with persistent volumes
- API container with health checks
- Proper networking and resource limits
- Environment file integration

#### 4. Initial Deployment
1. Push to `main` branch to trigger CI/CD pipeline
2. Monitor CI completion and automatic staging deployment
3. For production: Manually approve deployment via GitHub Issues
4. Verify health checks and functionality post-deployment

#### 5. Domain Configuration (Optional)
1. Update Nginx configuration in `/etc/nginx/sites-available/ecommerce-api`
2. Configure SSL certificates (Let's Encrypt recommended)
3. Update firewall rules if using custom ports