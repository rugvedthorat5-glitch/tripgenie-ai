@echo off
title TripGenie AI - College Project Launcher
color 0B
cls
echo ======================================================================
echo           TRIPGENIE AI - ONE-CLICK COLLEGE PROJECT LAUNCHER
echo ======================================================================
echo.

:: 1. Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [X] Node.js is NOT installed on this computer!
    echo.
    echo Please download and install Node.js (LTS version) from:
    echo     https://nodejs.org
    echo.
    echo After installing Node.js, simply double-click this file again!
    echo.
    pause
    exit /b
)

echo [*] Node.js detected:
node -v
echo.

:: 2. Ensure .env files exist
if not exist "backend\.env" (
    echo [*] Creating backend\.env from template...
    copy "backend\.env.example" "backend\.env" >nul
)
if not exist "frontend\.env" (
    echo [*] Creating frontend\.env from template...
    copy "frontend\.env.example" "frontend\.env" >nul
)

:: 3. Install backend packages if missing
if not exist "backend\node_modules\" (
    echo [*] Installing backend packages (first time only, please wait 30s)...
    cd backend
    call npm install
    cd ..
)

:: 4. Install frontend packages if missing
if not exist "frontend\node_modules\" (
    echo [*] Installing frontend packages (first time only, please wait 1 min)...
    cd frontend
    call npm install
    cd ..
)

:: 5. USB Android Phone detection (ADB Reverse)
where adb >nul 2>nul
if %errorlevel% equ 0 (
    echo [*] Android Debug Bridge (ADB) found. Checking USB connected phone...
    adb reverse tcp:5050 tcp:5050 >nul 2>nul
    adb reverse tcp:8081 tcp:8081 >nul 2>nul
    echo [OK] USB port forwarding active: Mobile phone can reach http://localhost:5050 directly over USB!
    echo.
)

:: 6. Launch Backend in a dedicated terminal window
echo [*] Starting Local Backend Server on port 5050...
start "TripGenie Backend (:5050)" cmd /k "cd backend && npm run dev"

:: 7. Launch Frontend Expo Server with Tunnel (allows phone connection from anywhere)
echo [*] Starting Frontend & Mobile Server...
echo.
echo ======================================================================
echo  1. WEB BROWSER: Press 'w' in this window to open Web App in Chrome.
echo  2. ANDROID PHONE: Scan the QR code below using the free 'Expo Go' app!
echo  3. BACKEND: Running locally on port 5050 (in the other window).
echo ======================================================================
echo.

cd frontend
call npx expo start --tunnel
cd ..

pause
