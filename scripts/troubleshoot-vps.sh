#!/bin/bash

# VPS Troubleshooting Script for E-commerce API
# Run this script on your VPS to diagnose deployment issues

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 E-commerce API VPS Troubleshooting${NC}"
echo -e "${BLUE}=====================================${NC}"

# Configuration
DEPLOY_DIR="/opt/ecommerce-api"

echo -e "${YELLOW}1. Checking deployment directory...${NC}"
if [ -d "$DEPLOY_DIR" ]; then
    echo -e "${GREEN}✅ Deployment directory exists: $DEPLOY_DIR${NC}"
    cd "$DEPLOY_DIR"
    echo -e "   Current directory: $(pwd)"
else
    echo -e "${RED}❌ Deployment directory not found: $DEPLOY_DIR${NC}"
    echo -e "${YELLOW}   Run the VPS setup script first${NC}"
    exit 1
fi

echo -e "\n${YELLOW}2. Checking required files...${NC}"
files=(".env" "docker-compose.vps.yml" ".env.vps")
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file exists${NC}"
    else
        echo -e "${RED}❌ $file missing${NC}"
    fi
done

echo -e "\n${YELLOW}3. Checking Docker installation...${NC}"
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✅ Docker is installed${NC}"
    echo -e "   Version: $(docker --version)"
    
    if docker info > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Docker is running${NC}"
    else
        echo -e "${RED}❌ Docker is not running${NC}"
        echo -e "${YELLOW}   Try: sudo systemctl start docker${NC}"
    fi
else
    echo -e "${RED}❌ Docker is not installed${NC}"
    exit 1
fi

echo -e "\n${YELLOW}4. Checking Docker Compose...${NC}"
if command -v docker-compose &> /dev/null; then
    echo -e "${GREEN}✅ Docker Compose is installed${NC}"
    echo -e "   Version: $(docker-compose --version)"
else
    echo -e "${RED}❌ Docker Compose is not installed${NC}"
    exit 1
fi

echo -e "\n${YELLOW}5. Checking user permissions...${NC}"
if groups | grep -q docker; then
    echo -e "${GREEN}✅ User is in docker group${NC}"
else
    echo -e "${RED}❌ User is not in docker group${NC}"
    echo -e "${YELLOW}   Run: sudo usermod -aG docker \$USER && newgrp docker${NC}"
fi

echo -e "\n${YELLOW}6. Checking environment file...${NC}"
if [ -f ".env" ]; then
    echo -e "${GREEN}✅ .env file exists${NC}"
    
    # Check critical environment variables
    required_vars=("DB_PASSWORD" "JWT_SECRET")
    for var in "${required_vars[@]}"; do
        if grep -q "^$var=" .env && ! grep -q "^$var=.*your.*here" .env; then
            echo -e "${GREEN}✅ $var is configured${NC}"
        else
            echo -e "${RED}❌ $var needs to be configured${NC}"
        fi
    done
else
    echo -e "${RED}❌ .env file missing${NC}"
    if [ -f ".env.vps" ]; then
        echo -e "${YELLOW}   Creating from template...${NC}"
        cp .env.vps .env
        echo -e "${YELLOW}   Please configure the .env file${NC}"
    fi
fi

echo -e "\n${YELLOW}7. Checking Docker image availability...${NC}"
if docker pull leangchhunhut/ecommerce-api:latest > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Docker image can be pulled${NC}"
else
    echo -e "${RED}❌ Cannot pull Docker image${NC}"
    echo -e "${YELLOW}   Check internet connection and Docker Hub credentials${NC}"
fi

echo -e "\n${YELLOW}8. Checking container status...${NC}"
if [ -f "docker-compose.vps.yml" ]; then
    container_status=$(docker-compose -f docker-compose.vps.yml ps 2>/dev/null || echo "none")
    if echo "$container_status" | grep -q "Up"; then
        echo -e "${GREEN}✅ Some containers are running${NC}"
        docker-compose -f docker-compose.vps.yml ps
    else
        echo -e "${RED}❌ No containers are running${NC}"
        echo -e "${YELLOW}   Last container logs:${NC}"
        docker-compose -f docker-compose.vps.yml logs --tail=20 2>/dev/null || echo "No logs available"
    fi
else
    echo -e "${RED}❌ docker-compose.vps.yml not found${NC}"
fi

echo -e "\n${YELLOW}9. Checking ports...${NC}"
ports=(3000 5432 80 443)
for port in "${ports[@]}"; do
    if netstat -tuln 2>/dev/null | grep -q ":$port "; then
        echo -e "${GREEN}✅ Port $port is in use${NC}"
    else
        echo -e "${YELLOW}⚠️  Port $port is available${NC}"
    fi
done

echo -e "\n${YELLOW}10. Checking firewall...${NC}"
if command -v ufw &> /dev/null; then
    if ufw status | grep -q "Status: active"; then
        echo -e "${GREEN}✅ UFW firewall is active${NC}"
        ufw status | grep -E "(3000|80|443)"
    else
        echo -e "${YELLOW}⚠️  UFW firewall is inactive${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  UFW not installed${NC}"
fi

echo -e "\n${BLUE}=====================================${NC}"
echo -e "${BLUE}Troubleshooting complete!${NC}"

if [ -f ".env" ] && [ -f "docker-compose.vps.yml" ] && docker info > /dev/null 2>&1; then
    echo -e "\n${GREEN}🚀 System looks ready for deployment!${NC}"
    echo -e "${YELLOW}Try running: ./scripts/deploy.sh${NC}"
else
    echo -e "\n${RED}❌ Issues found that need to be resolved${NC}"
    echo -e "${YELLOW}Fix the issues above and try again${NC}"
fi