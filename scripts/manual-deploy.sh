#!/bin/bash

# Manual VPS Deployment Script
# Use this script to manually deploy the latest Docker image to your VPS

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOCKER_IMAGE="leangchhunhut/ecommerce-api"
COMPOSE_FILE="docker-compose.vps.yml"
CONTAINER_NAME="ecommerce_api"

echo -e "${BLUE}🚀 Manual VPS Deployment Script${NC}"
echo -e "${BLUE}================================${NC}"

# Check if we're in the right directory
if [ ! -f "$COMPOSE_FILE" ]; then
    echo -e "${RED}❌ Error: $COMPOSE_FILE not found in current directory${NC}"
    echo -e "${YELLOW}Please run this script from /opt/ecommerce-api${NC}"
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Docker is not running${NC}"
    exit 1
fi

# Get current image info
echo -e "${YELLOW}📋 Current deployment info:${NC}"
if docker images | grep -q "$DOCKER_IMAGE"; then
    docker images | head -1
    docker images | grep "$DOCKER_IMAGE" | head -3
else
    echo -e "${YELLOW}No existing images found${NC}"
fi

echo ""

# Stop and remove existing container
echo -e "${YELLOW}🛑 Stopping existing containers...${NC}"
docker-compose -f "$COMPOSE_FILE" down

# Remove old image to force fresh pull
echo -e "${YELLOW}🧹 Removing old API image...${NC}"
docker rmi "$DOCKER_IMAGE:latest" 2>/dev/null || echo -e "${BLUE}ℹ️  No existing image to remove${NC}"

# Pull fresh image
echo -e "${YELLOW}🐳 Pulling latest Docker image...${NC}"
if docker pull "$DOCKER_IMAGE:latest"; then
    echo -e "${GREEN}✅ Successfully pulled latest image${NC}"
else
    echo -e "${RED}❌ Failed to pull latest image${NC}"
    exit 1
fi

# Show new image info
echo -e "${YELLOW}📋 New image info:${NC}"
docker images | head -1
docker images | grep "$DOCKER_IMAGE" | head -1

# Deploy with fresh image
echo -e "${YELLOW}🚀 Deploying with fresh image...${NC}"
docker-compose -f "$COMPOSE_FILE" pull api || echo -e "${BLUE}ℹ️  Compose pull failed, using manually pulled image${NC}"
docker-compose -f "$COMPOSE_FILE" up -d --remove-orphans

# Wait for services to start
echo -e "${YELLOW}⏳ Waiting for services to start...${NC}"
sleep 30

# Check deployment status
echo -e "${YELLOW}🔍 Checking deployment status...${NC}"
echo -e "${BLUE}Container Status:${NC}"
docker-compose -f "$COMPOSE_FILE" ps

if docker-compose -f "$COMPOSE_FILE" ps | grep -q "Up"; then
    echo -e "${GREEN}✅ Containers are running successfully!${NC}"
    
    # Optional health check
    echo -e "${YELLOW}🏥 Running health check...${NC}"
    if curl -f -m 10 http://localhost:3000/api/v1/health >/dev/null 2>&1; then
        echo -e "${GREEN}✅ API health check passed!${NC}"
        echo -e "${GREEN}🌐 API available at: http://localhost:3000${NC}"
        echo -e "${GREEN}📚 API docs at: http://localhost:3000/api/docs${NC}"
    else
        echo -e "${YELLOW}⚠️  Health check failed, but containers are running${NC}"
        echo -e "${BLUE}ℹ️  This might be normal if the application is still starting${NC}"
    fi
else
    echo -e "${RED}❌ Some containers failed to start!${NC}"
    echo -e "${YELLOW}📋 Container logs:${NC}"
    docker-compose -f "$COMPOSE_FILE" logs --tail=50
    exit 1
fi

# Cleanup old images
echo -e "${YELLOW}🧹 Cleaning up old images...${NC}"
docker image prune -f

echo -e "${GREEN}🎉 Manual deployment completed successfully!${NC}"
echo -e "${BLUE}================================${NC}"