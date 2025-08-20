#!/bin/bash

echo "🚀 Setting up Local Development Environment"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if PostgreSQL is running
echo -e "${BLUE}🔍 Checking PostgreSQL connection...${NC}"
if pg_isready -h localhost -p 5432 >/dev/null 2>&1; then
    echo -e "${GREEN}✅ PostgreSQL is running${NC}"
else
    echo -e "${RED}❌ PostgreSQL is not running. Please start it first:${NC}"
    echo -e "${YELLOW}   sudo systemctl start postgresql-17${NC}"
    exit 1
fi

# Check if Redis is running
echo -e "${BLUE}🔍 Checking Redis connection...${NC}"
if redis-cli ping >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Redis is running${NC}"
else
    echo -e "${RED}❌ Redis is not running. Please start it first:${NC}"
    echo -e "${YELLOW}   sudo systemctl start redis${NC}"
    exit 1
fi

# Install Node dependencies if not already done
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}📦 Installing Node.js dependencies...${NC}"
    npm install
fi

echo ""
echo -e "${GREEN}🎉 Setup complete!${NC}"
echo ""
echo -e "${YELLOW}📋 Database Setup Instructions:${NC}"
echo -e "  1. Create the database manually by running:"
echo -e "     ${BLUE}sudo -u postgres createdb ecommerce_db${NC}"
echo -e ""
echo -e "  2. Or connect as postgres user and create it:"
echo -e "     ${BLUE}sudo -u postgres psql -c \"CREATE DATABASE ecommerce_db;\"${NC}"
echo ""
echo -e "${BLUE}🚀 Start Development:${NC}"
echo -e "  1. ${YELLOW}npm run start:dev${NC} - Start the development server"
echo -e "  2. ${YELLOW}node test-auth.js${NC} - Test authentication (after server starts)"
echo ""
echo -e "${BLUE}🌐 Services will be available at:${NC}"
echo -e "  • API: ${YELLOW}http://localhost:3000${NC}"
echo -e "  • Swagger Docs: ${YELLOW}http://localhost:3000/api/docs${NC}"
echo ""
echo -e "${BLUE}💾 Database info:${NC}"
echo -e "  • Host: localhost:5432"
echo -e "  • Database: ecommerce_db"
echo -e "  • User: postgres"
echo ""
echo -e "${BLUE}📝 Note:${NC}"
echo -e "  The application will automatically create tables and seed data on first run"
echo -e "  TypeORM synchronization is enabled for development"