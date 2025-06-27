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
    
    REM Check if origin remote exists
    git remote get-url origin >nul 2>&1
    if %errorlevel% equ 0 (
        echo.
        echo Current origin remote:
        git remote get-url origin
        echo.
        set /p update_remote="Do you want to update the origin remote? (y/n): "
        if /i "!update_remote!"=="y" (
            set /p new_remote="Enter new GitHub repository URL: "
            git remote set-url origin !new_remote!
            echo Origin remote updated successfully!
        )
    ) else (
        echo No origin remote found.
        set /p add_remote="Do you want to add GitHub origin remote? (y/n): "
        if /i "!add_remote!"=="y" (
            set /p new_remote="Enter GitHub repository URL: "
            git remote add origin !new_remote!
            echo Origin remote added successfully!
        )
    )
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
    echo Repository initialized! Now adding GitHub remote...
    set /p add_remote="Do you want to add GitHub origin remote now? (y/n): "
    if /i "!add_remote!"=="y" (
        set /p new_remote="Enter GitHub repository URL: "
        git remote add origin !new_remote!
        echo Origin remote added successfully!
        
        echo Setting main branch and pushing...
        git branch -M main
        set /p push_now="Push to GitHub now? (y/n): "
        if /i "!push_now!"=="y" (
            git push -u origin main
            if %errorlevel% equ 0 (
                echo ✅ Successfully pushed to GitHub!
            ) else (
                echo ❌ Push failed. Please check your repository URL and permissions.
            )
        )
    )
    
    echo.
    echo ====================================
    echo Git repository initialized!
    echo ====================================
)

echo.
echo Git repository setup complete!
echo.
echo Manual GitHub setup (if needed):
echo 1. Create a new repository on GitHub
echo 2. If origin doesn't exist: git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
echo 3. If origin exists: git remote set-url origin https://github.com/YOUR_USERNAME/REPO_NAME.git
echo 4. Push: git push -u origin main
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
