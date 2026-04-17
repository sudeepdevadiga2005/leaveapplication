# AbsentAlert - PowerShell Launcher
# Initializes environment and launches backend + frontend servers.

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

# ── [1/4] Verify environment ──────────────────────────────────
Write-Host "  [1/4] Verifying environment..." -ForegroundColor Yellow

$pyCmd = "python"
if (-not (Test-CommandAvailable "python")) {
    if (Test-CommandAvailable "py") {
        $pyCmd = "py"
    } else {
        Write-Host "  [ERROR] Python not found. Please install Python 3.x" -ForegroundColor Red
        Read-Host "  Press Enter to exit"
        exit 1
    }
}

if (-not (Test-CommandAvailable "node")) {
    Write-Host "  [ERROR] Node.js not found. Please install Node.js" -ForegroundColor Red
    Read-Host "  Press Enter to exit"
    exit 1
}

Write-Host "  [OK] Python ($($pyCmd)) and Node.js detected." -ForegroundColor Green

# ── [2/4] Install dependencies ────────────────────────────────
Write-Host "  [2/4] Syncing dependencies..." -ForegroundColor Yellow

Set-Location "$root\backend"

# Install Python packages
& $pyCmd -m pip install -r requirements.txt --quiet 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "  [WARN] requirements.txt install failed, trying manual install..." -ForegroundColor DarkYellow
    & $pyCmd -m pip install flask flask-cors flask-sqlalchemy flask-mail werkzeug python-dotenv --quiet
}

# Run seed.py safely — errors here should NOT stop the launcher
Write-Host "  Seeding database..." -ForegroundColor DarkGray
& $pyCmd seed.py 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  [OK] Database seeded." -ForegroundColor Green
} else {
    Write-Host "  [WARN] Seed skipped or already up-to-date (non-fatal)." -ForegroundColor DarkYellow
}

Set-Location $root

# Install frontend dependencies (first run only)
$frontendPath = "$root\frontend-react"
if (-not (Test-Path "$frontendPath\node_modules")) {
    Write-Host "  Installing React dependencies (first time, please wait)..." -ForegroundColor DarkYellow
    Set-Location $frontendPath
    npm install --silent
    Set-Location $root
}

Write-Host "  [OK] Dependencies ready." -ForegroundColor Green

# ── [3/4] Start servers ───────────────────────────────────────
Write-Host "  [3/4] Launching servers..." -ForegroundColor Yellow

# Backend — Flask on port 5000
$backendCmd = "Set-Location '$root\backend'; $($pyCmd) app.py"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd -WindowStyle Normal

Write-Host "  [OK] Backend starting on http://localhost:5000" -ForegroundColor Green
Start-Sleep -Seconds 3

# Frontend — Vite on port 3000
$frontendCmd = "Set-Location '$frontendPath'; npm run dev"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd -WindowStyle Normal

Write-Host "  [OK] Frontend starting on http://localhost:3000" -ForegroundColor Green
Start-Sleep -Seconds 4

# ── [4/4] Open browser ────────────────────────────────────────
Write-Host "  [4/4] Opening browser..." -ForegroundColor Yellow
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "  ============================================" -ForegroundColor Cyan
Write-Host "   Backend  : http://localhost:5000          " -ForegroundColor White
Write-Host "   Frontend : http://localhost:3000          " -ForegroundColor White
Write-Host "  ============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Test Credentials:" -ForegroundColor DarkGray
Write-Host "   Admin    : sudeep@gmail.com / 123456789   " -ForegroundColor DarkGray
Write-Host "   Lecturer : priya@demo.com   / 1234        " -ForegroundColor DarkGray
Write-Host "   Student  : BCA2024001       / 1234        " -ForegroundColor DarkGray
Write-Host ""
Read-Host "  Press Enter to close this launcher"
