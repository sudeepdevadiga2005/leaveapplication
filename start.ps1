# AbsentAlert - PowerShell Launcher
# This script initializes the environment and launches backend/frontend servers.

$Host.UI.RawUI.WindowTitle = "AbsentAlert Launcher"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

function Show-Header {
    Clear-Host
    Write-Host ""
    Write-Host "  ============================================" -ForegroundColor Cyan
    Write-Host "    AbsentAlert - Automated Leave System     " -ForegroundColor White
    Write-Host "    One-Tap All-in-One Launcher              " -ForegroundColor DarkGray
    Write-Host "  ============================================" -ForegroundColor Cyan
    Write-Host ""
}

function Test-CommandAvailable($cmd) {
    return [bool](Get-Command $cmd -ErrorAction SilentlyContinue)
}

Show-Header

# Check environment
Write-Host "  [1/4] Verifying environment..." -ForegroundColor Yellow

$pyCmd = "python"
if (-not (Test-CommandAvailable "python")) {
    if (Test-CommandAvailable "py") {
        $pyCmd = "py"
    }
    else {
        Write-Host "  [ERROR] Python/Py not found. Please install Python 3.x" -ForegroundColor Red
        Read-Host "  Press Enter to exit"
        exit 1
    }
}

if (-not (Test-CommandAvailable "node")) {
    Write-Host "  [ERROR] Node.js not found. Please install Node.js" -ForegroundColor Red
    Read-Host "  Press Enter to exit"
    exit 1
}

Write-Host "  [OK] Python and Node.js detected." -ForegroundColor Green

# Dependencies
Write-Host "  [2/4] Syncing dependencies and database..." -ForegroundColor Yellow

Set-Location "$root\backend"
& $pyCmd -m pip install -r requirements.txt --quiet
if ($LASTEXITCODE -ne 0) {
    & $pyCmd -m pip install flask flask-cors flask-sqlalchemy flask-mail werkzeug --quiet
}

# Seed
& $pyCmd seed.py
Set-Location $root

# Frontend
if (-not (Test-Path "$root\frontend-react\node_modules")) {
    Write-Host "  Installing React dependencies (first time)..." -ForegroundColor DarkYellow
    Set-Location "$root\frontend-react"
    npm install --silent
    Set-Location $root
}

Write-Host "  [OK] Environment ready." -ForegroundColor Green

# Start Servers
Write-Host "  [3/4] Launching servers..." -ForegroundColor Yellow

Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\backend'; & $pyCmd app.py" -WindowStyle Normal
Start-Sleep -Seconds 2

Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\frontend-react'; npm run dev" -WindowStyle Normal
Start-Sleep -Seconds 4

Write-Host "  [OK] Servers are starting." -ForegroundColor Green

# Final
Write-Host "  [4/4] Finishing..." -ForegroundColor Yellow
Write-Host ""
Write-Host "  Opening browser: http://localhost:3000" -ForegroundColor Cyan
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "  ============================================" -ForegroundColor Cyan
Write-Host "   Backend  : http://localhost:5000          " -ForegroundColor White
Write-Host "   Frontend : http://localhost:3000          " -ForegroundColor White
Write-Host "  ============================================" -ForegroundColor Cyan
Write-Host ""
Read-Host "  Press Enter to close this launcher"
