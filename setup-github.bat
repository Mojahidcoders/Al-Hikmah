@echo off
echo ====================================
echo Al-Hikmah Academy - Quran Section
echo GitHub Repository Setup Script
echo ====================================
echo.

REM Check if Git is installed
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Git is not installed!
    echo Please download and install Git from: https://git-scm.com/
    echo After installation, run this script again.
    pause
    exit /b 1
)

echo Git found! Version:
git --version

echo.
echo Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo Please download and install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js found! Version:
node --version

echo.
echo Installing project dependencies...
npm install

if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies!
    pause
    exit /b 1
)

echo.
echo ====================================
echo Setting up Git repository...
echo ====================================

REM Check if already a git repository
if exist ".git" (
    echo Git repository already exists.
    echo Current status:
    git status --short
) else (
    echo Initializing Git repository...
    git init
    
    echo Adding all files...
    git add .
    
    echo Creating initial commit...
    git commit -m "🕌 Initial commit: Al-Hikmah Academy Quran Section

✨ Features:
- Complete Quran with 114 Surahs
- Arabic text with English & Urdu translations  
- Audio recitation with advanced controls
- Responsive Islamic-themed design
- Progressive Web App with offline support
- Express.js backend with API proxy

بسم الله - In the name of Allah"

    echo.
    echo ====================================
    echo Git repository initialized!
    echo ====================================
)

echo.
echo To connect to GitHub repository:
echo 1. Create a new repository on GitHub
echo 2. Run: git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
echo 3. Run: git branch -M main
echo 4. Run: git push -u origin main
echo.
echo To start the application:
echo Run: npm start
echo Then open: http://localhost:3000
echo.

set /p choice="Would you like to start the application now? (y/n): "
if /i "%choice%"=="y" (
    echo.
    echo Starting Al-Hikmah Academy Quran application...
    npm start
) else (
    echo.
    echo Setup completed! 
    echo جزاك الله خيراً - May Allah reward you with good!
    pause
)
