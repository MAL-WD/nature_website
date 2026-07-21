@echo off
echo ==========================================
echo Starting Nature App...
echo Please wait while the servers initialize.
echo ==========================================

:: Check if Node is installed
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed. Please install Node.js first.
    pause
    exit
)

:: Start Backend Server
echo Starting Backend Server...
start "Nature App Server" cmd /k "cd server && npm start"

:: Wait 5 seconds for backend to initialize
timeout /t 5 /nobreak >nul

:: Start Frontend Application
echo Starting Frontend...
start "Nature App Client" cmd /k "npm run dev"

:: Open in default browser (optional, usually Vite does this or you can click the link)
:: timeout /t 3 /nobreak >nul
:: start http://localhost:5173

echo.
echo ==========================================
echo App is running!
echo 1. Backend is running in one window.
echo 2. Frontend is running in another window.
echo.
echo You can access the app at: http://localhost:5173
echo ==========================================
pause
