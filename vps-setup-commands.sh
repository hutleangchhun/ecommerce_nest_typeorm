#!/bin/bash

# VPS Setup Commands for 157.10.73.27
# Run these commands on your VPS after connecting with SSH

echo "🔧 Setting up VPS for ecommerce API deployment..."

# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y curl git docker.io docker-compose nginx ufw

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Add ubuntu user to docker group
sudo usermod -aG docker ubuntu

# Create deployment user and directory
sudo useradd -m -s /bin/bash -G docker ecommerce || echo "User ecommerce already exists"
sudo mkdir -p /opt/ecommerce-api
sudo chown -R ecommerce:ecommerce /opt/ecommerce-api

# Set up SSH key for GitHub Actions
sudo mkdir -p /home/ecommerce/.ssh
echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIMf6XVc5IdMRmcpcn/tYgxqMl0LZoxQ6xImfw7OIEUNy github-actions-deploy" | sudo tee /home/ecommerce/.ssh/authorized_keys
sudo chmod 700 /home/ecommerce/.ssh
sudo chmod 600 /home/ecommerce/.ssh/authorized_keys
sudo chown -R ecommerce:ecommerce /home/ecommerce/.ssh

# Clone the repository
sudo -u ecommerce git clone https://github.com/hutleangchhun/ecommerce_nest_typeorm.git /opt/ecommerce-api

# Set up environment file
sudo -u ecommerce cp /opt/ecommerce-api/.env.vps /opt/ecommerce-api/.env
sudo -u ecommerce sed -i 's/your_secure_db_password_here/SecureDBPass2024/g' /opt/ecommerce-api/.env
sudo -u ecommerce sed -i 's/your-super-secure-jwt-secret-key-min-32-chars/MySecureJWTSecretKey123456789012/g' /opt/ecommerce-api/.env

# Set up firewall
sudo ufw --force enable
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 3000

# Make deploy script executable
sudo chmod +x /opt/ecommerce-api/scripts/deploy.sh
sudo chown ecommerce:ecommerce /opt/ecommerce-api/scripts/deploy.sh

# Test Docker access
sudo -u ecommerce docker --version

echo "✅ VPS setup complete!"
echo "🚀 Your VPS is ready for deployment!"
echo ""
echo "Next steps:"
echo "1. Add GitHub secrets"
echo "2. Test deployment pipeline"
echo ""
echo "API will be available at: http://157.10.73.27:3000"