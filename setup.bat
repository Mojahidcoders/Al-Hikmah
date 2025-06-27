@echo off
echo ====================================
echo Al-Hikmah Academy - Quran Section
echo Installation Script
echo ====================================
echo.

echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please download and install Node.js from: https://nodejs.org/
    echo After installation, run this script again.
    pause
    exit /b 1
)

echo Node.js found! Version:
node --version

echo.
echo Checking npm installation...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm is not available!
    echo Please ensure npm is installed with Node.js.
    pause
    exit /b 1
)

echo npm found! Version:
npm --version

echo.
echo Installing project dependencies...
npm install

if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies!
    echo Please check your internet connection and try again.
    pause
    exit /b 1
)

echo.
echo ====================================
echo Installation completed successfully!
echo ====================================
echo.
echo To start the application:
echo 1. Run: npm start
echo 2. Open your browser to: http://localhost:3000
echo.
echo For development mode with auto-restart:
echo Run: npm run dev
echo.
echo Press any key to start the application now...
pause >nul

echo Starting the Al-Hikmah Academy Quran application...
npm start
