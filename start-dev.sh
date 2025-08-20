#!/bin/bash

echo "🚀 Starting E-commerce API Development Environment"
echo "================================================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null 2>&1; then
    echo "❌ Docker Compose is not available. Please install Docker Compose."
    exit 1
fi

echo "📦 Starting database and Redis services..."

# Start PostgreSQL and Redis services only
if command -v docker-compose &> /dev/null; then
    docker-compose up -d postgres redis
else
    docker compose up -d postgres redis
fi

echo "⏳ Waiting for services to be ready..."

# Wait for PostgreSQL
echo "🔍 Checking PostgreSQL connection..."
for i in {1..30}; do
    if docker exec ecommerce_db pg_isready -U postgres > /dev/null 2>&1; then
        echo "✅ PostgreSQL is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ PostgreSQL failed to start after 30 attempts"
        exit 1
    fi
    sleep 2
done

# Wait for Redis
echo "🔍 Checking Redis connection..."
for i in {1..15}; do
    if docker exec ecommerce_redis redis-cli ping > /dev/null 2>&1; then
        echo "✅ Redis is ready!"
        break
    fi
    if [ $i -eq 15 ]; then
        echo "❌ Redis failed to start after 15 attempts"
        exit 1
    fi
    sleep 1
done

echo ""
echo "🎉 Services are ready! You can now start the API with:"
echo "   npm run start:dev"
echo ""
echo "📊 Available services:"
echo "   • PostgreSQL: localhost:5433"
echo "   • Redis: localhost:6379"
echo "   • pgAdmin: http://localhost:8080 (admin@example.com / admin123)"
echo ""
echo "📚 API Documentation will be available at:"
echo "   http://localhost:3000/api/docs"
echo ""
echo "🛑 To stop services: docker-compose down"