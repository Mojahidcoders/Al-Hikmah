#!/bin/bash

echo "===================================="
echo "Git Troubleshooting Helper"
echo "Al-Hikmah Academy - Quran Section"
echo "===================================="
echo

# Check if Git is installed
if ! command -v git &> /dev/null; then
    echo "ERROR: Git is not installed!"
    echo "Please install Git and try again."
    exit 1
fi

echo "Git is installed. Version:"
git --version
echo

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "This is not a Git repository!"
    echo "Run setup.sh first to initialize the repository."
    exit 1
fi

echo "Current Git status:"
git status --short
echo

echo "Checking remote configuration..."
git remote -v
echo

# Main troubleshooting menu
while true; do
    echo "===================================="
    echo "Choose an option:"
    echo "===================================="
    echo "1. Fix 'remote origin already exists' error"
    echo "2. Add new origin remote"
    echo "3. Update existing origin URL"
    echo "4. Remove origin remote"
    echo "5. Push to GitHub (with force if needed)"
    echo "6. Check repository status"
    echo "7. Reset to clean state"
    echo "8. Exit"
    echo
    read -p "Enter your choice (1-8): " choice

    case $choice in
        1)
            echo
            echo "Fixing 'remote origin already exists' error..."
            echo "Current origin:"
            git remote get-url origin 2>/dev/null || echo "No origin found"
            echo
            read -p "Enter the correct GitHub repository URL: " new_url
            if git remote set-url origin "$new_url"; then
                echo "✅ Origin URL updated successfully!"
                echo "New origin:" 
                git remote get-url origin
            else
                echo "❌ Failed to update origin URL"
            fi
            read -p "Press Enter to continue..."
            ;;
        2)
            echo
            echo "Adding new origin remote..."
            if git remote get-url origin >/dev/null 2>&1; then
                echo "Origin already exists:"
                git remote get-url origin
                echo "Use option 3 to update it instead."
            else
                read -p "Enter GitHub repository URL: " new_url
                if git remote add origin "$new_url"; then
                    echo "✅ Origin added successfully!"
                else
                    echo "❌ Failed to add origin"
                fi
            fi
            read -p "Press Enter to continue..."
            ;;
        3)
            echo
            echo "Updating existing origin URL..."
            echo "Current origin:"
            git remote get-url origin 2>/dev/null || echo "No origin found"
            read -p "Enter new GitHub repository URL: " new_url
            if git remote set-url origin "$new_url"; then
                echo "✅ Origin URL updated successfully!"
            else
                echo "❌ Failed to update origin URL"
            fi
            read -p "Press Enter to continue..."
            ;;
        4)
            echo
            echo "Removing origin remote..."
            if git remote remove origin; then
                echo "✅ Origin removed successfully!"
            else
                echo "❌ Failed to remove origin"
            fi
            read -p "Press Enter to continue..."
            ;;
        5)
            echo
            echo "Pushing to GitHub..."
            if ! git remote get-url origin >/dev/null 2>&1; then
                echo "No origin remote found! Use option 2 to add one first."
                read -p "Press Enter to continue..."
                continue
            fi

            echo "Current origin:"
            git remote get-url origin
            echo

            # Check if main branch exists
            if ! git show-ref --verify --quiet refs/heads/main; then
                echo "Creating main branch..."
                git branch -M main
            fi

            echo "Attempting to push..."
            if git push -u origin main; then
                echo "✅ Push successful!"
            else
                echo
                echo "Push failed. This might be because:"
                echo "1. Repository already has commits"
                echo "2. Authentication issues"
                echo "3. Repository doesn't exist on GitHub"
                echo
                read -p "Do you want to force push? (y/n): " force_push
                if [[ $force_push =~ ^[Yy]$ ]]; then
                    echo "Force pushing..."
                    if git push -u origin main --force; then
                        echo "✅ Force push successful!"
                    else
                        echo "❌ Force push failed. Check your GitHub credentials and repository."
                    fi
                fi
            fi
            read -p "Press Enter to continue..."
            ;;
        6)
            echo
            echo "===================================="
            echo "Repository Status"
            echo "===================================="
            echo
            echo "Git status:"
            git status
            echo
            echo "Remote configuration:"
            git remote -v
            echo
            echo "Branch information:"
            git branch -a
            echo
            echo "Recent commits:"
            git log --oneline -5 2>/dev/null || echo "No commits found"
            read -p "Press Enter to continue..."
            ;;
        7)
            echo
            echo "⚠️  WARNING: This will reset the repository to a clean state!"
            echo "This will remove all uncommitted changes."
            read -p "Are you sure? (y/n): " confirm
            if [[ $confirm =~ ^[Yy]$ ]]; then
                echo "Cleaning repository..."
                git reset --hard HEAD
                git clean -fd
                echo "✅ Repository reset to clean state"
            else
                echo "Reset cancelled."
            fi
            read -p "Press Enter to continue..."
            ;;
        8)
            echo
            echo "===================================="
            echo "Troubleshooting Complete"
            echo "===================================="
            echo
            echo "Common Git commands for reference:"
            echo "- git status                    : Check repository status"
            echo "- git remote -v                 : View remote URLs"
            echo "- git remote set-url origin URL : Update origin URL"
            echo "- git push -u origin main       : Push to GitHub"
            echo
            echo "جزاك الله خيراً - May Allah reward you with good!"
            echo
            exit 0
            ;;
        *)
            echo "Invalid choice. Please try again."
            ;;
    esac
done
