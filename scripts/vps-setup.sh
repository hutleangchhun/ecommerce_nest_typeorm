#!/bin/bash

# VPS Initial Setup Script for E-commerce API
# Run this script once on your VPS to set up the deployment environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DEPLOY_DIR="/opt/ecommerce-api"
REPO_URL="https://github.com/hutleangchhun/ecommerce_nest_typeorm.git"
USER="ecommerce"
SSH_PORT=${SSH_PORT:-2222}  # Default to 2222, can be overridden

echo -e "${YELLOW}🔧 Setting up VPS for E-commerce API deployment...${NC}"

# Update system
echo -e "${YELLOW}📦 Updating system packages...${NC}"
sudo apt update && sudo apt upgrade -y

# Install required packages
echo -e "${YELLOW}📦 Installing required packages...${NC}"
sudo apt install -y curl git docker.io docker-compose nginx ufw

# Start and enable Docker
echo -e "${YELLOW}🐳 Setting up Docker...${NC}"
sudo systemctl start docker
sudo systemctl enable docker

# Create deployment user
echo -e "${YELLOW}👤 Creating deployment user...${NC}"
if ! id "$USER" &>/dev/null; then
    sudo useradd -m -s /bin/bash "$USER"
    sudo usermod -aG docker "$USER"
    echo -e "${GREEN}✅ User $USER created and added to docker group${NC}"
else
    echo -e "${YELLOW}User $USER already exists${NC}"
fi

# Create deployment directory
echo -e "${YELLOW}📁 Creating deployment directory...${NC}"
sudo mkdir -p "$DEPLOY_DIR"
sudo chown -R "$USER:$USER" "$DEPLOY_DIR"

# Clone repository
echo -e "${YELLOW}📥 Cloning repository...${NC}"
if [ ! -d "$DEPLOY_DIR/.git" ]; then
    sudo -u "$USER" git clone "$REPO_URL" "$DEPLOY_DIR"
else
    echo -e "${YELLOW}Repository already cloned${NC}"
fi

# Set up environment file
echo -e "${YELLOW}⚙️ Setting up environment file...${NC}"
if [ ! -f "$DEPLOY_DIR/.env" ]; then
    sudo -u "$USER" cp "$DEPLOY_DIR/.env.example" "$DEPLOY_DIR/.env"
    echo -e "${YELLOW}📝 Please edit $DEPLOY_DIR/.env with your configuration${NC}"
fi

# Make deploy script executable
chmod +x "$DEPLOY_DIR/scripts/deploy.sh"

# Configure SSH security
echo -e "${YELLOW}🔐 Configuring SSH security...${NC}"
if [ "$SSH_PORT" != "22" ]; then
    echo -e "${YELLOW}📝 Configuring SSH port to $SSH_PORT...${NC}"
    
    # Backup original sshd_config
    sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup
    
    # Update SSH port
    sudo sed -i "s/#Port 22/Port $SSH_PORT/g" /etc/ssh/sshd_config
    sudo sed -i "s/Port 22/Port $SSH_PORT/g" /etc/ssh/sshd_config
    
    # Disable password authentication (key-only authentication)
    sudo sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/g' /etc/ssh/sshd_config
    sudo sed -i 's/PasswordAuthentication yes/PasswordAuthentication no/g' /etc/ssh/sshd_config
    
    # Disable root login
    sudo sed -i 's/#PermitRootLogin yes/PermitRootLogin no/g' /etc/ssh/sshd_config
    sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/g' /etc/ssh/sshd_config
    
    echo -e "${GREEN}✅ SSH configured to use port $SSH_PORT${NC}"
    echo -e "${YELLOW}⚠️  SSH will restart after firewall configuration${NC}"
fi

# Set up firewall
echo -e "${YELLOW}🔥 Configuring firewall...${NC}"
sudo ufw --force enable
sudo ufw allow "$SSH_PORT/tcp"  # Custom SSH port
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3000  # API port

# Set up nginx (optional)
echo -e "${YELLOW}🌐 Setting up Nginx configuration...${NC}"
sudo mkdir -p /etc/nginx/sites-available
sudo mkdir -p /etc/nginx/sites-enabled

# Create nginx config
sudo tee /etc/nginx/sites-available/ecommerce-api > /dev/null <<EOF
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;  # Update this!

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable nginx config
sudo ln -sf /etc/nginx/sites-available/ecommerce-api /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and reload nginx
sudo nginx -t && sudo systemctl reload nginx

# Set up log rotation
echo -e "${YELLOW}📋 Setting up log rotation...${NC}"
sudo tee /etc/logrotate.d/ecommerce-api > /dev/null <<EOF
/opt/ecommerce-api/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    sharedscripts
    postrotate
        docker-compose -f /opt/ecommerce-api/docker-compose.vps.yml restart api
    endscript
}
EOF

# Restart SSH service if port was changed
if [ "$SSH_PORT" != "22" ]; then
    echo -e "${YELLOW}🔄 Restarting SSH service...${NC}"
    sudo systemctl restart sshd
    
    echo -e "${GREEN}✅ SSH service restarted${NC}"
    echo -e "${RED}⚠️  IMPORTANT: SSH port changed to $SSH_PORT${NC}"
    echo -e "${RED}⚠️  Make sure to update your SSH connection and GitHub secrets!${NC}"
    echo -e "${YELLOW}New SSH command: ssh $USER@your-vps-ip -p $SSH_PORT${NC}"
fi

echo -e "${GREEN}🎉 VPS setup completed!${NC}"
echo -e "${YELLOW}📋 Next steps:${NC}"
echo -e "1. Edit $DEPLOY_DIR/.env with your database credentials"
echo -e "2. Update the repository URL in this script"
echo -e "3. Update your domain in /etc/nginx/sites-available/ecommerce-api"
echo -e "4. Add your VPS SSH key to GitHub repository secrets"
echo -e "5. Configure GitHub secrets for deployment"
echo -e ""
echo -e "${YELLOW}GitHub Secrets to configure:${NC}"
echo -e "- DOCKERHUB_USERNAME: Your Docker Hub username"
echo -e "- DOCKERHUB_TOKEN: Your Docker Hub access token"
echo -e "- VPS_HOST: Your VPS IP address"
echo -e "- VPS_USER: ecommerce"
echo -e "- VPS_SSH_KEY: Your private SSH key"
echo -e "- VPS_PORT: $SSH_PORT"