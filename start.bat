@echo off
REM Car Rental Service Startup Script for Windows
REM This script starts both the backend and frontend services automatically

echo 🚗 Starting Car Rental Service...
echo ==================================

REM Get the script directory
set SCRIPT_DIR=%~dp0
set BACKEND_DIR=%SCRIPT_DIR%backend
set FRONTEND_DIR=%SCRIPT_DIR%client

REM Check if directories exist
if not exist "%BACKEND_DIR%" (
    echo ❌ Backend directory not found: %BACKEND_DIR%
    pause
    exit /b 1
)

if not exist "%FRONTEND_DIR%" (
    echo ❌ Frontend directory not found: %FRONTEND_DIR%
    pause
    exit /b 1
)

REM Check for required tools
echo 🔍 Checking system requirements...

python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH. Please install Python first.
    pause
    exit /b 1
)

npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not installed or not in PATH. Please install Node.js and npm first.
    pause
    exit /b 1
)

echo ✅ System requirements satisfied
echo.

REM Kill existing processes on ports (if running)
echo 🔧 Cleaning up existing processes...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173') do taskkill /f /pid %%a >nul 2>&1

REM Install backend dependencies if needed
echo 📦 Setting up backend...
cd /d "%BACKEND_DIR%"

if exist "requirements.txt" (
    echo Installing Python dependencies...
    pip install -r requirements.txt --quiet
) else (
    echo ⚠️ No requirements.txt found in backend directory
)

REM Install frontend dependencies if needed
echo 📦 Setting up frontend...
cd /d "%FRONTEND_DIR%"

if not exist "node_modules" (
    echo Installing Node.js dependencies...
    npm install --silent
) else (
    echo ✅ Node.js dependencies already installed
)

echo.
echo 🚀 Starting services...
echo.

REM Start backend in background
echo 🔥 Starting backend server (FastAPI on port 3001)...
cd /d "%BACKEND_DIR%"
start "Car Rental Backend" /min python src/app.py

REM Wait for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend in background
echo 🎨 Starting frontend server (React + Vite on port 5173)...
cd /d "%FRONTEND_DIR%"
start "Car Rental Frontend" /min npm run dev

REM Wait for frontend to start
timeout /t 5 /nobreak >nul

echo.
echo 🎉 Car Rental Service is now running!
echo ==================================
echo 🔗 Frontend: http://localhost:5173
echo 🔗 Backend API: http://localhost:3001
echo 🔗 API Docs: http://localhost:3001/docs
echo.
echo 🌐 Opening browser...

REM Open browser
timeout /t 2 /nobreak >nul
start http://localhost:5173

echo.
echo ✋ Both services are running in separate windows
echo 💡 Close the terminal windows to stop the services
echo.
pause
