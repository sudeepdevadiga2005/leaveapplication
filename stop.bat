@echo off
title AbsentAlert — Stop Servers
color 0C

echo.
echo  Stopping AbsentAlert servers...
echo.

:: Kill processes on port 5000 (Flask)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5000"') do (
    taskkill /F /PID %%a >nul 2>&1
)

:: Kill processes on port 3000 (React/Vite)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000"') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo  [OK] Servers stopped.
echo.
pause
