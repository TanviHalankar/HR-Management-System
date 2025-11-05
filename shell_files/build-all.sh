#!/bin/bash

# Build script for all Docker images
# This script builds all Docker images for the HR Management System

set -e

echo "=========================================="
echo "Building HR Management System Docker Images"
echo "=========================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to build a service
build_service() {
    local service_name=$1
    local service_path=$2
    
    echo -e "${YELLOW}Building $service_name...${NC}"
    cd "$service_path"
    
    # Build Maven project first
    echo "Building Maven project..."
    mvn clean package -DskipTests
    
    # Build Docker image
    echo "Building Docker image..."
    docker build -t "$service_name:latest" .
    
    cd ..
    echo -e "${GREEN}✓ $service_name built successfully${NC}"
    echo ""
}

# Build Frontend
echo -e "${YELLOW}Building Frontend...${NC}"
cd frontend
docker build --build-arg REACT_APP_API_BASE_URL=http://api-gateway:8080 -t frontend:latest .
cd ..
echo -e "${GREEN}✓ Frontend built successfully${NC}"
echo ""

# Build Config Server
build_service "config-server" "config-server"

# Build Eureka Server
build_service "eureka-server" "eureka-server"

# Build API Gateway
build_service "api-gateway" "api-gateway"

# Build User Service
build_service "user-service" "user-service"

# Build Employee Service
build_service "employee-service" "employee-service"

# Build Payroll Service
build_service "payroll-service" "payroll-service"

# Build Attendance Service
build_service "attendance-service" "attendance-service"

echo "=========================================="
echo -e "${GREEN}All images built successfully!${NC}"
echo "=========================================="
echo ""
echo "Images built:"
docker images | grep -E "(frontend|config-server|eureka-server|api-gateway|user-service|employee-service|payroll-service|attendance-service)" | grep latest

