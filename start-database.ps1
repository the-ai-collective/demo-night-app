# PowerShell script to start Docker Compose services
# Usage: .\start-database.ps1

# Check if Docker is running
try {
    docker version | Out-Null
} catch {
    Write-Host "Error: Docker is not running. Please start Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Check if services are already running
$running = docker compose ps -q

if ($running) {
    Write-Host "Docker compose services are already running!" -ForegroundColor Green
    exit 0
}

# Start the services
Write-Host "Starting Docker compose services..." -ForegroundColor Cyan
docker compose up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host "Docker compose services were successfully created!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Services running:" -ForegroundColor Cyan
    Write-Host "  - PostgreSQL: localhost:5432" -ForegroundColor White
    Write-Host "  - Redis: localhost:6379" -ForegroundColor White
    Write-Host "  - Redis HTTP: localhost:8079" -ForegroundColor White
} else {
    Write-Host "Error: Failed to start Docker compose services" -ForegroundColor Red
    exit 1
}
