#!/bin/bash

# Deployment script with complete cleanup
echo "🚀 Starting deployment with complete cleanup..."

# Stop and remove all running containers
echo "🛑 Stopping all running containers..."
docker stop $(docker ps -aq) 2>/dev/null || true
docker rm $(docker ps -aq) 2>/dev/null || true

# Remove all images
echo "🗑️ Removing all Docker images..."
docker rmi $(docker images -aq) 2>/dev/null || true

# Remove all volumes (optional - uncomment if needed)
# echo "🗑️ Removing all volumes..."
# docker volume rm $(docker volume ls -q) 2>/dev/null || true

# Remove all networks (optional - uncomment if needed)
# echo "🗑️ Removing all networks..."
# docker network rm $(docker network ls -q) 2>/dev/null || true

# Clean up system
echo "🧹 Cleaning up Docker system..."
docker system prune -af --volumes

# Build new image
echo "🔨 Building new Docker image..."
docker build -t greenvy-frontend .

# Run new container
echo "🚀 Starting new container..."
docker run -d -p 8080:8080 --name greenvy-frontend-container greenvy-frontend

echo "✅ Deployment complete! Application is running on http://localhost:8080"
echo "📊 Container status:"
docker ps
