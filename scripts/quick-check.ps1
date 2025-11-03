# Quick Status Check Script
# This avoids hanging by using timeouts

Write-Host "=== Minikube Status ===" -ForegroundColor Cyan
minikube status 2>&1 | Select-Object -First 10

Write-Host "`n=== Kubernetes Pods ===" -ForegroundColor Cyan
try {
    $job = Start-Job { kubectl get pods 2>&1 }
    Wait-Job $job -Timeout 15 | Out-Null
    if ($job.State -eq 'Running') {
        Stop-Job $job
        Write-Host "Command timed out - Kubernetes API may be slow" -ForegroundColor Yellow
    } else {
        Receive-Job $job
    }
    Remove-Job $job -ErrorAction SilentlyContinue
} catch {
    Write-Host "Could not connect to Kubernetes API" -ForegroundColor Red
    Write-Host "Try: minikube start" -ForegroundColor Yellow
}

Write-Host "`n=== Docker Images ===" -ForegroundColor Cyan
docker images | Select-String "config-server|eureka-server|api-gateway|user-service|employee-service|payroll-service|attendance-service" | Select-Object -First 10

Write-Host "`n=== Minikube IP ===" -ForegroundColor Cyan
$ip = minikube ip 2>&1
if ($ip -match "^\d+\.\d+\.\d+\.\d+$") {
    Write-Host "API Gateway: http://$ip`:30080" -ForegroundColor Green
    Write-Host "Eureka:      http://$ip`:30761" -ForegroundColor Green
} else {
    Write-Host "Minikube not running or IP not available" -ForegroundColor Yellow
}


