@echo off
REM Kubernetes deployment script for HR Management System (Windows)
REM This script deploys all services to Kubernetes (minikube)

echo ==========================================
echo Deploying HR Management System to Kubernetes
echo ==========================================
echo.

REM Check if minikube is running
minikube status >nul 2>&1
if errorlevel 1 (
    echo Minikube is not running. Starting minikube...
    minikube start
)

REM Use minikube's Docker daemon
echo Using minikube's Docker daemon...
call minikube docker-env | cmd /v /c set

REM Build all images first
echo Building all Docker images...
call build-all.bat

REM Deploy databases first
echo Deploying databases...
kubectl apply -f k8s\userdb-deployment.yaml
kubectl apply -f k8s\userdb-service.yaml
kubectl apply -f k8s\employeedb-deployment.yaml
kubectl apply -f k8s\employeedb-service.yaml
kubectl apply -f k8s\payrolldb-deployment.yaml
kubectl apply -f k8s\payrolldb-service.yaml
kubectl apply -f k8s\attendancedb-deployment.yaml
kubectl apply -f k8s\attendancedb-service.yaml

echo Waiting for databases to be ready...
timeout /t 30 /nobreak >nul

REM Deploy config server
echo Deploying Config Server...
kubectl apply -f k8s\config-server-deployment.yaml
kubectl apply -f k8s\config-server-service.yaml

timeout /t 15 /nobreak >nul

REM Deploy eureka server
echo Deploying Eureka Server...
kubectl apply -f k8s\eureka-server-deployment.yaml
kubectl apply -f k8s\eureka-server-service.yaml

timeout /t 30 /nobreak >nul

REM Deploy microservices
echo Deploying microservices...
kubectl apply -f k8s\user-service-deployment.yaml
kubectl apply -f k8s\user-service-service.yaml
kubectl apply -f k8s\employee-service-deployment.yaml
kubectl apply -f k8s\employee-service-service.yaml
kubectl apply -f k8s\payroll-service-deployment.yaml
kubectl apply -f k8s\payroll-service-service.yaml
kubectl apply -f k8s\attendance-service-deployment.yaml
kubectl apply -f k8s\attendance-service-service.yaml

timeout /t 30 /nobreak >nul

REM Deploy API Gateway
echo Deploying API Gateway...
kubectl apply -f k8s\api-gateway-deployment.yaml
kubectl apply -f k8s\api-gateway-service.yaml

timeout /t 15 /nobreak >nul

REM Deploy Frontend
echo Deploying Frontend...
kubectl apply -f k8s\frontend-deployment.yaml
kubectl apply -f k8s\frontend-service.yaml

echo.
echo ==========================================
echo Deployment completed!
echo ==========================================
echo.
echo Checking pod status...
kubectl get pods
echo.
echo Getting service URLs...
echo.
echo To access services:
echo   Frontend:       minikube service frontend-service --url
echo   API Gateway:    minikube service api-gateway --url
echo   Eureka Server:  minikube service eureka-server-service --url
echo.
echo Or use:
echo   minikube service frontend-service
echo   minikube service api-gateway
echo   minikube service eureka-server-service

