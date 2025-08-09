#!/bin/bash

# VPS Deployment Script for E-commerce API
# This script is executed on the VPS to deploy the application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DEPLOY_DIR="/opt/ecommerce-api"
REPO_URL="https://github.com/hutleangchhun/ecommerce_nest_typeorm.git"
IMAGE_NAME="leangchhunhut/ecommerce-api:latest"

echo -e "${YELLOW}🚀 Starting deployment...${NC}"

# Check if deployment directory exists
if [ ! -d "$DEPLOY_DIR" ]; then
    echo -e "${RED}❌ Deployment directory $DEPLOY_DIR not found!${NC}"
    echo -e "${YELLOW}Please run the initial setup first.${NC}"
    exit 1
fi

# Navigate to deployment directory
cd "$DEPLOY_DIR"

# Pull latest code
echo -e "${YELLOW}📥 Pulling latest code...${NC}"
git pull origin main

# Pull latest Docker image
echo -e "${YELLOW}🐳 Pulling latest Docker image...${NC}"
docker pull "$IMAGE_NAME"

# Stop existing containers
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
docker-compose -f docker-compose.vps.yml down

# Start new containers
echo -e "${YELLOW}🆙 Starting new containers...${NC}"
docker-compose -f docker-compose.vps.yml up -d

# Wait for services to start
echo -e "${YELLOW}⏳ Waiting for services to start...${NC}"
sleep 15

# Health check
echo -e "${YELLOW}🏥 Running health check...${NC}"
if docker-compose -f docker-compose.vps.yml ps | grep -q "Up"; then
    echo -e "${GREEN}✅ Containers are running!${NC}"
    
    # Test API endpoint
    if curl -f -s http://localhost:3000/api/v1/categories > /dev/null; then
        echo -e "${GREEN}✅ API health check passed!${NC}"
    else
        echo -e "${RED}❌ API health check failed!${NC}"
        docker-compose -f docker-compose.vps.yml logs api
        exit 1
    fi
else
    echo -e "${RED}❌ Containers failed to start!${NC}"
    docker-compose -f docker-compose.vps.yml logs
    exit 1
fi

# Clean up old images
echo -e "${YELLOW}🧹 Cleaning up old Docker images...${NC}"
docker image prune -f

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${GREEN}API is available at: http://$(hostname -I | awk '{print $1}'):3000${NC}"
echo -e "${GREEN}Swagger docs at: http://$(hostname -I | awk '{print $1}'):3000/api/docs${NC}"