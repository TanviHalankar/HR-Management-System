#!/bin/bash

# Kubernetes Deployment Script for HR Management System
# This script builds Docker images and deploys to minikube

set -e

echo "=========================================="
echo "HRMS Kubernetes Deployment Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if minikube is running
check_minikube() {
    print_info "Checking minikube status..."
    if ! minikube status > /dev/null 2>&1; then
        print_error "Minikube is not running!"
        print_info "Starting minikube with recommended resources..."
        minikube start --memory=4096 --cpus=4
    else
        print_info "Minikube is running"
    fi
    
    # Enable minikube docker daemon
    print_info "Configuring Docker to use minikube's Docker daemon..."
    eval $(minikube docker-env)
}

# Build Docker images
build_images() {
    print_info "Building Docker images..."
    
    SERVICES=("config-server" "eureka-server" "api-gateway" "user-service" 
             "employee-service" "payroll-service" "attendance-service")
    
    for service in "${SERVICES[@]}"; do
        print_info "Building ${service}..."
        cd "$service"
        if [ -f "Dockerfile" ]; then
            docker build -t "${service}:latest" .
            print_info "${service} image built successfully"
        else
            print_warn "Dockerfile not found in ${service}, skipping..."
        fi
        cd ..
    done
}

# Wait for pod to be ready
wait_for_pod() {
    local app_label=$1
    local timeout=${2:-120}
    print_info "Waiting for ${app_label} to be ready (timeout: ${timeout}s)..."
    
    if kubectl wait --for=condition=ready pod -l app=${app_label} --timeout=${timeout}s > /dev/null 2>&1; then
        print_info "${app_label} is ready"
        return 0
    else
        print_error "${app_label} failed to become ready"
        return 1
    fi
}

# Deploy in order
deploy_services() {
    print_info "Deploying services to Kubernetes..."
    
    # 1. Config Server
    print_info "Deploying Config Server..."
    kubectl apply -f k8s/config-server-deployment.yaml
    kubectl apply -f k8s/config-server-service.yaml
    wait_for_pod "config-server" 120
    
    # 2. Eureka Server
    print_info "Deploying Eureka Server..."
    kubectl apply -f k8s/eureka-server-deployment.yaml
    kubectl apply -f k8s/eureka-server-service.yaml
    wait_for_pod "eureka-server" 120
    
    # 3. Databases
    print_info "Deploying Databases..."
    
    databases=("userdb" "employeedb" "payrolldb" "attendancedb")
    for db in "${databases[@]}"; do
        print_info "Deploying ${db}..."
        kubectl apply -f "k8s/${db}-deployment.yaml"
        kubectl apply -f "k8s/${db}-service.yaml"
    done
    
    # Wait for all databases to be ready
    for db in "${databases[@]}"; do
        wait_for_pod "${db}" 180
    done
    
    # 4. Microservices
    print_info "Deploying Microservices..."
    
    services=("user-service" "employee-service" "payroll-service" "attendance-service")
    for service in "${services[@]}"; do
        print_info "Deploying ${service}..."
        kubectl apply -f "k8s/${service}-deployment.yaml"
        kubectl apply -f "k8s/${service}-service.yaml"
    done
    
    # Wait for services to be ready
    for service in "${services[@]}"; do
        wait_for_pod "${service}" 180
    done
    
    # 5. API Gateway
    print_info "Deploying API Gateway..."
    kubectl apply -f k8s/api-gateway-deployment.yaml
    kubectl apply -f k8s/api-gateway-service.yaml
    wait_for_pod "api-gateway" 180
}

# Display deployment status
show_status() {
    print_info "Deployment Status:"
    echo ""
    echo "Pods:"
    kubectl get pods
    echo ""
    echo "Services:"
    kubectl get services
    echo ""
    
    MINIKUBE_IP=$(minikube ip)
    print_info "Access the application:"
    echo "  API Gateway:  http://${MINIKUBE_IP}:30080"
    echo "  Eureka:       http://${MINIKUBE_IP}:30761"
    echo ""
}

# Main execution
main() {
    print_info "Starting deployment process..."
    
    # Check prerequisites
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed!"
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed!"
        exit 1
    fi
    
    # Get script directory
    SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
    PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
    
    cd "$PROJECT_ROOT"
    
    # Run deployment steps
    check_minikube
    build_images
    deploy_services
    show_status
    
    print_info "Deployment completed successfully!"
    print_info "Note: It may take a few minutes for all services to be fully ready."
}

# Run main function
main "$@"

