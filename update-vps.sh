#!/bin/bash
# VPS Docker update script - pulls latest image and redeploys

echo "Stopping current containers..."
docker-compose -f docker-compose.vps.yml down

echo "Pulling latest image from Docker Hub..."
docker pull leangchhunhut/ecommerce-api:latest

echo "Removing old containers and images..."
docker container prune -f
docker image prune -f

echo "Deploying with latest image..."
docker-compose -f docker-compose.vps.yml up -d --force-recreate

echo "Checking deployment status..."
docker ps
docker logs ecommerce_api --tail 20