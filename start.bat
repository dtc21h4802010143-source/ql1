@echo off
setlocal enabledelayedexpansion

echo 🚀 Modern HRMS - Local Development Startup
echo ===========================================
echo.

REM Check if node_modules exist
if not exist "node_modules" (
    echo 📦 Installing root dependencies...
    call npm install
)

REM Check backend node_modules
if not exist "modern-stack\backend\node_modules" (
    echo 📦 Installing backend dependencies...
    call npm --prefix modern-stack/backend install
)

REM Check frontend node_modules
if not exist "modern-stack\frontend\node_modules" (
    echo 📦 Installing frontend dependencies...
    call npm --prefix modern-stack/frontend install
)

echo.
echo ✅ All dependencies installed successfully!
echo.
echo 🎯 Starting Modern HRMS...
echo    Backend:  http://localhost:5000
echo    Frontend: http://localhost:5173
echo    API:      http://localhost:5000/api
echo.
echo Press Ctrl+C to stop all services
echo.

call npm run dev
pause
