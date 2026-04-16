@echo off
title AbsentAlert — Launch System
color 0A

echo.
echo  ============================================
echo    AbsentAlert — Automated Leave System
echo  ============================================
echo.

:: ── Check Python ──────────────────────────────
python --version >nul 2>&1
if errorlevel 1 (
    echo  [ERROR] Python not found. Please install Python 3.x
    echo  Download: https://www.python.org/downloads/
    pause
    exit /b 1
)

:: ── Check Node ────────────────────────────────
node --version >nul 2>&1
if errorlevel 1 (
    echo  [ERROR] Node.js not found. Please install Node.js
    echo  Download: https://nodejs.org/
    pause
    exit /b 1
)

:: ── Install Python deps if needed ─────────────
echo  [1/4] Checking Python dependencies...
pip show flask >nul 2>&1
if errorlevel 1 (
    echo  Installing Flask dependencies...
    pip install flask flask-cors flask-sqlalchemy werkzeug
)
echo  [OK] Python dependencies ready.

:: ── Install Node deps if needed ───────────────
echo  [2/4] Checking Node dependencies...
if not exist "frontend-react\node_modules" (
    echo  Installing React dependencies...
    cd frontend-react
    npm install
    cd ..
)
echo  [OK] Node dependencies ready.

:: ── Start Flask Backend ───────────────────────
echo  [3/4] Starting Flask backend on http://localhost:5000 ...
start "AbsentAlert — Flask Backend" cmd /k "cd /d %~dp0backend && python app.py"
timeout /t 3 /nobreak >nul

:: ── Start React Frontend ──────────────────────
echo  [4/4] Starting React frontend on http://localhost:3000 ...
start "AbsentAlert — React Frontend" cmd /k "cd /d %~dp0frontend-react && npm run dev"
timeout /t 4 /nobreak >nul

:: ── Open browser ──────────────────────────────
echo.
echo  [OK] Both servers started!
echo.
echo  Opening browser...
start http://localhost:3000

echo.
echo  ============================================
echo   Backend  : http://localhost:5000
echo   Frontend : http://localhost:3000
echo  ============================================
echo.
echo  Close the two terminal windows to stop servers.
echo.
pause
