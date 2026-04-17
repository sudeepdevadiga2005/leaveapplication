@echo off
title AbsentAlert — One-Tap Launch System
color 0B

echo.
echo  ============================================
echo    AbsentAlert — Automated Leave System
echo    Full Stack Launcher (All-in-One)
echo  ============================================
echo.

:: ── Check Prerequisites ─────────────────────────
echo  [1/6] Verifying prerequisites...
python --version >nul 2>&1
if errorlevel 1 (
    py --version >nul 2>&1
    if errorlevel 1 (
        echo  [ERROR] Python was not found. Please install Python 3.x
        pause
        exit /b 1
    ) else (
        set PY_CMD=py
    )
) else (
    set PY_CMD=python
)

node --version >nul 2>&1
if errorlevel 1 (
    echo  [ERROR] Node.js was not found. Please install Node.js
    pause
    exit /b 1
)

echo  [OK] Prerequisites found.
echo.

:: ── Backend Dependencies ────────────────────────
echo  [2/6] Synchronizing Backend dependencies...
cd backend
%PY_CMD% -m pip install -r requirements.txt
if errorlevel 1 (
    echo  [WARNING] Pip install failed. Attempting direct install...
    %PY_CMD% -m pip install flask flask-cors flask-sqlalchemy flask-mail werkzeug
)
cd ..
echo  [OK] Backend ready.
echo.

:: ── Frontend Dependencies ───────────────────────
echo  [3/6] Synchronizing Frontend dependencies...
if not exist "frontend-react\node_modules" (
    echo  Installing React packages (this may take a minute color)...
    cd frontend-react
    call npm install
    cd ..
)
echo  [OK] Frontend ready.
echo.

:: ── Database Setup ─────────────────────────────
echo  [4/6] Initializing Database (Seeding)...
cd backend
%PY_CMD% seed.py
cd ..
echo  [OK] Database initialized.
echo.

:: ── Start Flask Backend ────────────────────────
echo  [5/6] Starting Flask backend in a new window...
start "AbsentAlert — Backend (Flask)" cmd /k "cd /d %~dp0backend && %PY_CMD% app.py"
timeout /t 3 /nobreak >nul

:: ── Start React Frontend ───────────────────────
echo  [6/6] Starting React frontend in a new window...
start "AbsentAlert — Frontend (React)" cmd /k "cd /d %~dp0frontend-react && npm run dev"
timeout /t 5 /nobreak >nul

:: ── Launch browser ─────────────────────────────
echo.
echo  [DONE] Both servers are running!
echo.
echo  Opening http://localhost:3000 ...
start http://localhost:3000

echo.
echo  ============================================
echo   Backend  : http://localhost:5000
echo   Frontend : http://localhost:3000
echo  ============================================
echo.
echo  NOTE: Keep the other two windows open to keep the servers running.
echo.
pause
