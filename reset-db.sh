#!/bin/bash

echo "🧹 Resetting Database for Development"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}⚠️  This will drop and recreate the ecommerce_db database${NC}"
echo -e "${YELLOW}⚠️  All existing data will be lost${NC}"
echo ""
read -p "Are you sure you want to continue? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}Operation cancelled${NC}"
    exit 0
fi

echo -e "${BLUE}🗑️  Dropping existing database...${NC}"
sudo -u postgres dropdb ecommerce_db 2>/dev/null || echo -e "${YELLOW}Database might not exist${NC}"

echo -e "${BLUE}📊 Creating fresh database...${NC}"
sudo -u postgres createdb ecommerce_db

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database recreated successfully${NC}"
    echo ""
    echo -e "${GREEN}🚀 You can now start the application with:${NC}"
    echo -e "${YELLOW}   npm run start:dev${NC}"
else
    echo -e "${RED}❌ Failed to create database${NC}"
    exit 1
fi