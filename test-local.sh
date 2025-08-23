#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🐳 Greenvy Frontend - Local Docker Testing${NC}"
echo "================================================"

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Stop and remove existing containers
echo -e "${BLUE}🧹 Cleaning up existing containers...${NC}"
docker stop greenvy-frontend-test 2>/dev/null || true
docker rm greenvy-frontend-test 2>/dev/null || true
docker rmi greenvy-frontend-test 2>/dev/null || true

# Build the Docker image
echo -e "${BLUE}🔨 Building Docker image...${NC}"
if docker build -t greenvy-frontend-test .; then
    print_status "Docker image built successfully"
else
    print_error "Docker build failed"
    exit 1
fi

# Run the container
echo -e "${BLUE}🚀 Starting container...${NC}"
if docker run -d --name greenvy-frontend-test -p 8080:8080 greenvy-frontend-test; then
    print_status "Container started successfully"
else
    print_error "Failed to start container"
    exit 1
fi

# Wait for container to be ready
echo -e "${BLUE}⏳ Waiting for container to be ready...${NC}"
sleep 5

# Check if container is running
if docker ps | grep -q greenvy-frontend-test; then
    print_status "Container is running"
else
    print_error "Container is not running"
    docker logs greenvy-frontend-test
    exit 1
fi

# Test health endpoint
echo -e "${BLUE}🏥 Testing health endpoint...${NC}"
if curl -f http://localhost:8080/health > /dev/null 2>&1; then
    print_status "Health endpoint is working"
else
    print_warning "Health endpoint not responding"
fi

# Test main application
echo -e "${BLUE}🌐 Testing main application...${NC}"
if curl -f http://localhost:8080 > /dev/null 2>&1; then
    print_status "Main application is accessible"
else
    print_error "Main application is not accessible"
    docker logs greenvy-frontend-test
    exit 1
fi

# Test React Router (should return index.html)
echo -e "${BLUE}🔄 Testing React Router...${NC}"
if curl -s http://localhost:8080/some-random-route | grep -q "index.html\|React\|greenvy" 2>/dev/null; then
    print_status "React Router is working correctly"
else
    print_warning "React Router might not be working properly"
fi

# Show container info
echo -e "${BLUE}📊 Container Information:${NC}"
echo "  - Container ID: $(docker ps -q --filter name=greenvy-frontend-test)"
echo "  - Port: 8080"
echo "  - Status: $(docker ps --format 'table {{.Status}}' --filter name=greenvy-frontend-test | tail -n 1)"

# Show access URLs
echo -e "${BLUE}🌍 Access URLs:${NC}"
echo "  - Main App: http://localhost:8080"
echo "  - Health Check: http://localhost:8080/health"

# Show logs
echo -e "${BLUE}📋 Recent logs:${NC}"
docker logs --tail 10 greenvy-frontend-test

echo ""
echo -e "${GREEN}🎉 Local testing completed successfully!${NC}"
echo ""
echo -e "${YELLOW}To stop the container:${NC}"
echo "  docker stop greenvy-frontend-test"
echo ""
echo -e "${YELLOW}To view logs:${NC}"
echo "  docker logs -f greenvy-frontend-test"
echo ""
echo -e "${YELLOW}To remove the container:${NC}"
echo "  docker rm greenvy-frontend-test"
