@echo off
REM Build script for all Docker images (Windows)
REM This script builds all Docker images for the HR Management System

echo ==========================================
echo Building HR Management System Docker Images
echo ==========================================
echo.

REM Build Frontend
echo Building Frontend...
cd frontend
call docker build --build-arg REACT_APP_API_BASE_URL=http://api-gateway:8080 -t frontend:latest .
cd ..
echo Frontend built successfully!
echo.

REM Build Config Server
echo Building Config Server...
cd config-server
call mvn clean package -DskipTests
call docker build -t config-server:latest .
cd ..
echo Config Server built successfully!
echo.

REM Build Eureka Server
echo Building Eureka Server...
cd eureka-server
call mvn clean package -DskipTests
call docker build -t eureka-server:latest .
cd ..
echo Eureka Server built successfully!
echo.

REM Build API Gateway
echo Building API Gateway...
cd api-gateway
call mvn clean package -DskipTests
call docker build -t api-gateway:latest .
cd ..
echo API Gateway built successfully!
echo.

REM Build User Service
echo Building User Service...
cd user-service
call mvn clean package -DskipTests
call docker build -t user-service:latest .
cd ..
echo User Service built successfully!
echo.

REM Build Employee Service
echo Building Employee Service...
cd employee-service
call mvn clean package -DskipTests
call docker build -t employee-service:latest .
cd ..
echo Employee Service built successfully!
echo.

REM Build Payroll Service
echo Building Payroll Service...
cd payroll-service
call mvn clean package -DskipTests
call docker build -t payroll-service:latest .
cd ..
echo Payroll Service built successfully!
echo.

REM Build Attendance Service
echo Building Attendance Service...
cd attendance-service
call mvn clean package -DskipTests
call docker build -t attendance-service:latest .
cd ..
echo Attendance Service built successfully!
echo.

echo ==========================================
echo All images built successfully!
echo ==========================================
echo.
echo Listing built images:
docker images | findstr "frontend config-server eureka-server api-gateway user-service employee-service payroll-service attendance-service"

