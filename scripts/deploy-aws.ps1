# AWS Deployment Helper Script
# Helps upload project to EC2 and deploy

param(
    [Parameter(Mandatory=$true)]
    [string]$EC2IP,
    
    [Parameter(Mandatory=$true)]
    [string]$KeyPath,
    
    [Parameter(Mandatory=$false)]
    [string]$RemotePath = "/home/ubuntu/HRMS"
)

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "AWS Deployment Helper Script" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

$ErrorActionPreference = "Stop"

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

# Check if key file exists
if (-not (Test-Path $KeyPath)) {
    Write-Error "Key file not found: $KeyPath"
    exit 1
}

Write-Info "Uploading project files to EC2..."
Write-Host "EC2 IP: $EC2IP" -ForegroundColor Gray
Write-Host "Key Path: $KeyPath" -ForegroundColor Gray
Write-Host "Remote Path: $RemotePath" -ForegroundColor Gray
Write-Host ""

# Upload files
Write-Info "Uploading files (this may take a few minutes)..."
scp -i $KeyPath -r * ubuntu@${EC2IP}:${RemotePath} 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to upload files"
    exit 1
}

Write-Info "Files uploaded successfully!"
Write-Host ""

Write-Info "Next steps:"
Write-Host "1. Connect to EC2: ssh -i $KeyPath ubuntu@$EC2IP" -ForegroundColor Yellow
Write-Host "2. Navigate to project: cd $RemotePath" -ForegroundColor Yellow
Write-Host "3. Update docker-compose-aws.yml with RDS details" -ForegroundColor Yellow
Write-Host "4. Deploy: docker-compose -f docker-compose-aws.yml up -d --build" -ForegroundColor Yellow
Write-Host ""

Write-Info "Deployment helper script completed!"


