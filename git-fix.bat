@echo off
echo ====================================
echo Git Troubleshooting Helper
echo Al-Hikmah Academy - Quran Section
echo ====================================
echo.

REM Check if Git is installed
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Git is not installed!
    echo Please download and install Git from: https://git-scm.com/
    pause
    exit /b 1
)

echo Git is installed. Version:
git --version
echo.

REM Check if we're in a git repository
if not exist ".git" (
    echo This is not a Git repository!
    echo Run setup-github.bat first to initialize the repository.
    pause
    exit /b 1
)

echo Current Git status:
git status --short
echo.

echo Checking remote configuration...
git remote -v
echo.

REM Main troubleshooting menu
:menu
echo ====================================
echo Choose an option:
echo ====================================
echo 1. Fix "remote origin already exists" error
echo 2. Add new origin remote
echo 3. Update existing origin URL
echo 4. Remove origin remote
echo 5. Push to GitHub (with force if needed)
echo 6. Check repository status
echo 7. Reset to clean state
echo 8. Exit
echo.
set /p choice="Enter your choice (1-8): "

if "%choice%"=="1" goto fix_origin_exists
if "%choice%"=="2" goto add_origin
if "%choice%"=="3" goto update_origin
if "%choice%"=="4" goto remove_origin
if "%choice%"=="5" goto push_github
if "%choice%"=="6" goto check_status
if "%choice%"=="7" goto reset_clean
if "%choice%"=="8" goto exit
echo Invalid choice. Please try again.
goto menu

:fix_origin_exists
echo.
echo Fixing "remote origin already exists" error...
echo Current origin:
git remote get-url origin 2>nul || echo No origin found
echo.
set /p new_url="Enter the correct GitHub repository URL: "
git remote set-url origin "%new_url%"
if %errorlevel% equ 0 (
    echo ✅ Origin URL updated successfully!
    echo New origin: 
    git remote get-url origin
) else (
    echo ❌ Failed to update origin URL
)
pause
goto menu

:add_origin
echo.
echo Adding new origin remote...
git remote get-url origin >nul 2>&1
if %errorlevel% equ 0 (
    echo Origin already exists:
    git remote get-url origin
    echo Use option 3 to update it instead.
) else (
    set /p new_url="Enter GitHub repository URL: "
    git remote add origin "%new_url%"
    if %errorlevel% equ 0 (
        echo ✅ Origin added successfully!
    ) else (
        echo ❌ Failed to add origin
    )
)
pause
goto menu

:update_origin
echo.
echo Updating existing origin URL...
echo Current origin:
git remote get-url origin 2>nul || echo No origin found
set /p new_url="Enter new GitHub repository URL: "
git remote set-url origin "%new_url%"
if %errorlevel% equ 0 (
    echo ✅ Origin URL updated successfully!
) else (
    echo ❌ Failed to update origin URL
)
pause
goto menu

:remove_origin
echo.
echo Removing origin remote...
git remote remove origin
if %errorlevel% equ 0 (
    echo ✅ Origin removed successfully!
) else (
    echo ❌ Failed to remove origin
)
pause
goto menu

:push_github
echo.
echo Pushing to GitHub...
git remote get-url origin >nul 2>&1
if %errorlevel% neq 0 (
    echo No origin remote found! Use option 2 to add one first.
    pause
    goto menu
)

echo Current origin:
git remote get-url origin
echo.

REM Check if main branch exists
git show-ref --verify --quiet refs/heads/main
if %errorlevel% neq 0 (
    echo Creating main branch...
    git branch -M main
)

echo Attempting to push...
git push -u origin main
if %errorlevel% neq 0 (
    echo.
    echo Push failed. This might be because:
    echo 1. Repository already has commits
    echo 2. Authentication issues
    echo 3. Repository doesn't exist on GitHub
    echo.
    set /p force_push="Do you want to force push? (y/n): "
    if /i "%force_push%"=="y" (
        echo Force pushing...
        git push -u origin main --force
        if %errorlevel% equ 0 (
            echo ✅ Force push successful!
        ) else (
            echo ❌ Force push failed. Check your GitHub credentials and repository.
        )
    )
) else (
    echo ✅ Push successful!
)
pause
goto menu

:check_status
echo.
echo ====================================
echo Repository Status
echo ====================================
echo.
echo Git status:
git status
echo.
echo Remote configuration:
git remote -v
echo.
echo Branch information:
git branch -a
echo.
echo Recent commits:
git log --oneline -5 2>nul || echo No commits found
pause
goto menu

:reset_clean
echo.
echo ⚠️  WARNING: This will reset the repository to a clean state!
echo This will remove all uncommitted changes.
set /p confirm="Are you sure? (y/n): "
if /i "%confirm%"=="y" (
    echo Cleaning repository...
    git reset --hard HEAD
    git clean -fd
    echo ✅ Repository reset to clean state
) else (
    echo Reset cancelled.
)
pause
goto menu

:exit
echo.
echo ====================================
echo Troubleshooting Complete
echo ====================================
echo.
echo Common Git commands for reference:
echo - git status                    : Check repository status
echo - git remote -v                 : View remote URLs
echo - git remote set-url origin URL : Update origin URL
echo - git push -u origin main       : Push to GitHub
echo.
echo جزاك الله خيراً - May Allah reward you with good!
echo.
pause
