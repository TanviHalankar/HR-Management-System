# Kubernetes Deployment Script for HR Management System
# PowerShell script for Windows

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "HRMS Kubernetes Deployment Script" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Green
}

function Write-Warn {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check if minikube is running
function Check-Minikube {
    Write-Info "Checking minikube status..."
    
    try {
        $status = minikube status 2>&1 | Out-String
        if ($status -match "apiserver:\s+Running") {
            Write-Info "Minikube is running"
        } else {
            throw "Minikube API server is not running"
        }
    } catch {
        Write-Error "Minikube is not running!"
        Write-Info "Starting minikube with available resources..."
        # Try with less memory if default fails
        minikube start --memory=3000 --cpus=2
        if ($LASTEXITCODE -ne 0) {
            Write-Warn "Failed to start with 3000MB, trying default settings..."
            minikube start
            if ($LASTEXITCODE -ne 0) {
                Write-Error "Failed to start minikube"
                exit 1
            }
        }
    }
    
    # Enable minikube docker daemon
    Write-Info "Configuring Docker to use minikube's Docker daemon..."
    minikube docker-env | Invoke-Expression
}

# Build Docker images
function Build-Images {
    Write-Info "Building Docker images..."
    
    $services = @("config-server", "eureka-server", "api-gateway", "user-service", 
                  "employee-service", "payroll-service", "attendance-service")
    
    foreach ($service in $services) {
        Write-Info "Building $service..."
        
        if (Test-Path "$service\Dockerfile") {
            Set-Location $service
            docker build -t "${service}:latest" .
            if ($LASTEXITCODE -ne 0) {
                Write-Error "Failed to build $service"
                exit 1
            }
            Write-Info "$service image built successfully"
            Set-Location ..
        } else {
            Write-Warn "Dockerfile not found in $service, skipping..."
        }
    }
}

# Wait for pod to be ready
function Wait-ForPod {
    param(
        [string]$AppLabel,
        [int]$Timeout = 120
    )
    
    Write-Info "Waiting for $AppLabel to be ready (timeout: ${Timeout}s)..."
    
    $startTime = Get-Date
    $timeout = New-TimeSpan -Seconds $Timeout
    
    do {
        Start-Sleep -Seconds 5
        $pods = kubectl get pods -l app=$AppLabel -o json | ConvertFrom-Json
        
        if ($pods.items.Count -gt 0) {
            $pod = $pods.items[0]
            $condition = $pod.status.conditions | Where-Object { $_.type -eq "Ready" }
            
            if ($condition -and $condition.status -eq "True") {
                Write-Info "$AppLabel is ready"
                return $true
            }
        }
        
        $elapsed = (Get-Date) - $startTime
        
    } while ($elapsed -lt $timeout)
    
    Write-Error "$AppLabel failed to become ready within ${Timeout}s"
    return $false
}

# Deploy services
function Deploy-Services {
    Write-Info "Deploying services to Kubernetes..."
    
    # 1. Config Server
    Write-Info "Deploying Config Server..."
    kubectl apply -f k8s\config-server-deployment.yaml
    kubectl apply -f k8s\config-server-service.yaml
    if (-not (Wait-ForPod "config-server" 120)) {
        exit 1
    }
    
    # 2. Eureka Server
    Write-Info "Deploying Eureka Server..."
    kubectl apply -f k8s\eureka-server-deployment.yaml
    kubectl apply -f k8s\eureka-server-service.yaml
    if (-not (Wait-ForPod "eureka-server" 120)) {
        exit 1
    }
    
    # 3. Databases
    Write-Info "Deploying Databases..."
    $databases = @("userdb", "employeedb", "payrolldb", "attendancedb")
    
    foreach ($db in $databases) {
        Write-Info "Deploying $db..."
        kubectl apply -f "k8s\${db}-deployment.yaml"
        kubectl apply -f "k8s\${db}-service.yaml"
    }
    
    # Wait for databases
    foreach ($db in $databases) {
        if (-not (Wait-ForPod $db 180)) {
            Write-Warn "$db not ready, continuing..."
        }
    }
    
    # 4. Microservices
    Write-Info "Deploying Microservices..."
    $services = @("user-service", "employee-service", "payroll-service", "attendance-service")
    
    foreach ($service in $services) {
        Write-Info "Deploying $service..."
        kubectl apply -f "k8s\${service}-deployment.yaml"
        kubectl apply -f "k8s\${service}-service.yaml"
    }
    
    # Wait for services
    foreach ($service in $services) {
        if (-not (Wait-ForPod $service 180)) {
            Write-Warn "$service not ready, continuing..."
        }
    }
    
    # 5. API Gateway
    Write-Info "Deploying API Gateway..."
    kubectl apply -f k8s\api-gateway-deployment.yaml
    kubectl apply -f k8s\api-gateway-service.yaml
    if (-not (Wait-ForPod "api-gateway" 180)) {
        Write-Warn "API Gateway not ready, but deployment may still be in progress..."
    }
}

# Display deployment status
function Show-Status {
    Write-Info "Deployment Status:"
    Write-Host ""
    Write-Host "Pods:" -ForegroundColor Cyan
    kubectl get pods
    Write-Host ""
    Write-Host "Services:" -ForegroundColor Cyan
    kubectl get services
    Write-Host ""
    
    $minikubeIP = minikube ip
    Write-Info "Access the application:"
    Write-Host "  API Gateway:  http://${minikubeIP}:30080" -ForegroundColor Yellow
    Write-Host "  Eureka:       http://${minikubeIP}:30761" -ForegroundColor Yellow
    Write-Host ""
}

# Main execution
function Main {
    Write-Info "Starting deployment process..."
    
    # Check prerequisites
    if (-not (Get-Command kubectl -ErrorAction SilentlyContinue)) {
        Write-Error "kubectl is not installed!"
        exit 1
    }
    
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Error "Docker is not installed!"
        exit 1
    }
    
    # Get script directory and project root
    if ($PSScriptRoot) {
        $scriptDir = $PSScriptRoot
    } else {
        $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
    }
    $projectRoot = Split-Path -Parent $scriptDir
    
    Write-Info "Script directory: $scriptDir"
    Write-Info "Project root: $projectRoot"
    
    Set-Location $projectRoot
    
    # Run deployment steps
    Check-Minikube
    Build-Images
    Deploy-Services
    Show-Status
    
    Write-Info "Deployment completed successfully!"
    Write-Info "Note: It may take a few minutes for all services to be fully ready."
}

# Run main function
Main

