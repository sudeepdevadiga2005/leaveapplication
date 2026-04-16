# AbsentAlert — PowerShell Launcher
# Run with: Right-click → Run with PowerShell

$Host.UI.RawUI.WindowTitle = "AbsentAlert Launcher"
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

function Write-Header {
    Clear-Host
    Write-Host ""
    Write-Host "  ============================================" -ForegroundColor Cyan
    Write-Host "    AbsentAlert — Automated Leave System     " -ForegroundColor White
    Write-Host "    Team: Sudeep | Bhagyaraj | Vishwas | Sumukha" -ForegroundColor DarkGray
    Write-Host "  ============================================" -ForegroundColor Cyan
    Write-Host ""
}

function Check-Command($cmd) {
    return [bool](Get-Command $cmd -ErrorAction SilentlyContinue)
}

Write-Header

# ── Check prerequisites ──────────────────────────────────────
Write-Host "  Checking prerequisites..." -ForegroundColor Yellow

if (-not (Check-Command "python")) {
    Write-Host "  [ERROR] Python not found. Install from https://python.org" -ForegroundColor Red
    Read-Host "  Press Enter to exit"
    exit 1
}
$pyVer = python --version 2>&1
Write-Host "  [OK] $pyVer" -ForegroundColor Green

if (-not (Check-Command "node")) {
    Write-Host "  [ERROR] Node.js not found. Install from https://nodejs.org" -ForegroundColor Red
    Read-Host "  Press Enter to exit"
    exit 1
}
$nodeVer = node --version 2>&1
Write-Host "  [OK] Node.js $nodeVer" -ForegroundColor Green

# ── Install Python deps ──────────────────────────────────────
Write-Host ""
Write-Host "  [1/4] Checking Python dependencies..." -ForegroundColor Yellow
$flaskCheck = pip show flask 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "  Installing Flask dependencies..." -ForegroundColor DarkYellow
    Set-Location "$root\backend"
    pip install -r requirements.txt
    Set-Location $root
}
Write-Host "  [OK] Python dependencies ready." -ForegroundColor Green

# ── Install Node deps ────────────────────────────────────────
Write-Host "  [2/4] Checking Node dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "$root\frontend-react\node_modules")) {
    Write-Host "  Installing React dependencies (first time only)..." -ForegroundColor DarkYellow
    Set-Location "$root\frontend-react"
    npm install
    Set-Location $root
}
Write-Host "  [OK] Node dependencies ready." -ForegroundColor Green

# ── Start Flask ──────────────────────────────────────────────
Write-Host "  [3/4] Starting Flask backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\backend'; python app.py" -WindowStyle Normal

Start-Sleep -Seconds 3
Write-Host "  [OK] Flask running on http://localhost:5000" -ForegroundColor Green

# ── Start React ──────────────────────────────────────────────
Write-Host "  [4/4] Starting React frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\frontend-react'; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 4
Write-Host "  [OK] React running on http://localhost:3000" -ForegroundColor Green

# ── Open browser ─────────────────────────────────────────────
Write-Host ""
Write-Host "  Opening browser..." -ForegroundColor Yellow
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "  ============================================" -ForegroundColor Cyan
Write-Host "   Backend  : http://localhost:5000          " -ForegroundColor White
Write-Host "   Frontend : http://localhost:3000          " -ForegroundColor White
Write-Host "  ============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Demo Credentials:" -ForegroundColor Yellow
Write-Host "   Student    : arjun@demo.com    / 1234" -ForegroundColor DarkGray
Write-Host "   Lecturer   : priya@demo.com    / 1234" -ForegroundColor DarkGray
Write-Host "   Management : admin@demo.com    / admin123" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  Close the two PowerShell windows to stop servers." -ForegroundColor DarkGray
Write-Host ""
Read-Host "  Press Enter to exit this launcher"
