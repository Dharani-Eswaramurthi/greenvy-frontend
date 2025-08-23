#!/bin/bash

echo "🚀 Starting Greenvy Frontend Deployment..."

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Remove old images
echo "🧹 Cleaning up old images..."
docker system prune -f

# Build new image
echo "🔨 Building new Docker image..."
docker-compose build --no-cache

# Start the application
echo "▶️ Starting the application..."
docker-compose up -d

# Wait for the application to be ready
echo "⏳ Waiting for application to be ready..."
sleep 10

# Check if the application is running
echo "🔍 Checking application status..."
if curl -f http://localhost/health > /dev/null 2>&1; then
    echo "✅ Application is running successfully!"
    echo "🌐 Access your application at: http://localhost"
else
    echo "❌ Application failed to start properly"
    echo "📋 Checking logs..."
    docker-compose logs
    exit 1
fi

echo "🎉 Deployment completed successfully!"
