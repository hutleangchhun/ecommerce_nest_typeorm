#!/bin/bash

# VPS Services Setup Script
# This script installs and configures PostgreSQL and Redis on Ubuntu/Debian VPS

set -e

echo "🚀 Setting up VPS services for E-commerce API..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root. Please run as a regular user with sudo privileges."
   exit 1
fi

# Update system packages
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install PostgreSQL
print_status "Installing PostgreSQL..."
sudo apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
print_status "Starting PostgreSQL service..."
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Configure PostgreSQL
print_status "Configuring PostgreSQL..."

# Set password for postgres user (you'll need to update this in GitHub Secrets)
DB_PASSWORD=${1:-"ecommerce123"}
print_warning "Setting PostgreSQL password to: $DB_PASSWORD"
print_warning "Make sure to update your GitHub Secret 'DB_PASSWORD' with this value!"

sudo -u postgres psql -c "ALTER USER postgres PASSWORD '$DB_PASSWORD';"

# Create database
print_status "Creating ecommerce_db database..."
sudo -u postgres createdb ecommerce_db 2>/dev/null || print_warning "Database ecommerce_db already exists"

# Configure PostgreSQL for local connections
print_status "Configuring PostgreSQL authentication..."
PG_VERSION=$(sudo -u postgres psql -t -c "SELECT version();" | grep -oP '\d+\.\d+' | head -1)
PG_CONFIG_DIR="/etc/postgresql/$PG_VERSION/main"

# Backup original config
sudo cp "$PG_CONFIG_DIR/pg_hba.conf" "$PG_CONFIG_DIR/pg_hba.conf.backup"

# Allow local connections with password
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = 'localhost'/" "$PG_CONFIG_DIR/postgresql.conf"
sudo sed -i "s/local   all             postgres                                peer/local   all             postgres                                md5/" "$PG_CONFIG_DIR/pg_hba.conf"
sudo sed -i "s/local   all             all                                     peer/local   all             all                                     md5/" "$PG_CONFIG_DIR/pg_hba.conf"

# Restart PostgreSQL to apply changes
print_status "Restarting PostgreSQL..."
sudo systemctl restart postgresql

# Install Redis
print_status "Installing Redis..."
sudo apt install -y redis-server

# Configure Redis
print_status "Configuring Redis..."
sudo cp /etc/redis/redis.conf /etc/redis/redis.conf.backup

# Configure Redis for local access
sudo sed -i "s/bind 127.0.0.1 ::1/bind 127.0.0.1/" /etc/redis/redis.conf
sudo sed -i "s/# requirepass foobared/# requirepass foobared/" /etc/redis/redis.conf

# Start and enable Redis
print_status "Starting Redis service..."
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Install Docker (if not already installed)
if ! command -v docker &> /dev/null; then
    print_status "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
else
    print_status "Docker is already installed"
fi

# Install Docker Compose (if not already installed)
if ! command -v docker-compose &> /dev/null; then
    print_status "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
else
    print_status "Docker Compose is already installed"
fi

# Start Docker service
print_status "Starting Docker service..."
sudo systemctl start docker
sudo systemctl enable docker

# Create deployment directory
print_status "Creating deployment directory..."
sudo mkdir -p /opt/ecommerce-api
sudo chown $USER:$USER /opt/ecommerce-api

# Test services
print_status "Testing services..."

# Test PostgreSQL
if sudo -u postgres psql -d ecommerce_db -c "SELECT 1;" > /dev/null 2>&1; then
    print_status "✅ PostgreSQL is working correctly"
else
    print_error "❌ PostgreSQL test failed"
fi

# Test Redis
if redis-cli ping | grep -q "PONG"; then
    print_status "✅ Redis is working correctly"
else
    print_error "❌ Redis test failed"
fi

# Test Docker
if docker --version > /dev/null 2>&1; then
    print_status "✅ Docker is working correctly"
else
    print_error "❌ Docker test failed"
fi

# Display service status
print_status "Service Status:"
echo "PostgreSQL: $(sudo systemctl is-active postgresql)"
echo "Redis: $(sudo systemctl is-active redis-server)"
echo "Docker: $(sudo systemctl is-active docker)"

print_status "🎉 VPS setup completed successfully!"
echo ""
print_warning "IMPORTANT NEXT STEPS:"
echo "1. Update your GitHub Secret 'DB_PASSWORD' with: $DB_PASSWORD"
echo "2. If you're using SSH keys, you may need to log out and back in for Docker group membership to take effect"
echo "3. Test the connection: psql -h localhost -U postgres -d ecommerce_db"
echo "4. Test Redis: redis-cli ping"
echo ""
print_status "Your VPS is now ready for deployment!"