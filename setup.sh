#!/bin/bash

echo "===================================="
echo "Al-Hikmah Academy - Quran Section"
echo "Installation Script"
echo "===================================="
echo

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed!"
    echo "Please download and install Node.js from: https://nodejs.org/"
    echo "After installation, run this script again."
    exit 1
fi

echo "Node.js found! Version:"
node --version

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "ERROR: npm is not available!"
    echo "Please ensure npm is installed with Node.js."
    exit 1
fi

echo "npm found! Version:"
npm --version

echo
echo "Installing project dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install dependencies!"
    echo "Please check your internet connection and try again."
    exit 1
fi

echo
echo "===================================="
echo "Installation completed successfully!"
echo "===================================="
echo
echo "To start the application:"
echo "1. Run: npm start"
echo "2. Open your browser to: http://localhost:3000"
echo
echo "For development mode with auto-restart:"
echo "Run: npm run dev"
echo
echo "Press Enter to start the application now..."
read

echo
echo "===================================="
echo "Setting up Git repository..."
echo "===================================="

# Check if already a git repository
if [ -d ".git" ]; then
    echo "Git repository already exists."
    echo "Current status:"
    git status --short
    
    # Check if origin remote exists
    if git remote get-url origin >/dev/null 2>&1; then
        echo
        echo "Current origin remote:"
        git remote get-url origin
        echo
        read -p "Do you want to update the origin remote? (y/n): " update_remote
        if [[ $update_remote =~ ^[Yy]$ ]]; then
            read -p "Enter new GitHub repository URL: " new_remote
            git remote set-url origin "$new_remote"
            echo "Origin remote updated successfully!"
        fi
    else
        echo "No origin remote found."
        read -p "Do you want to add GitHub origin remote? (y/n): " add_remote
        if [[ $add_remote =~ ^[Yy]$ ]]; then
            read -p "Enter GitHub repository URL: " new_remote
            git remote add origin "$new_remote"
            echo "Origin remote added successfully!"
        fi
    fi
else
    echo "Initializing Git repository..."
    git init
    
    echo "Adding all files..."
    git add .
    
    echo "Creating initial commit..."
    git commit -m "🕌 Initial commit: Al-Hikmah Academy Quran Section

✨ Features:
- Complete Quran with 114 Surahs
- Arabic text with English & Urdu translations  
- Audio recitation with advanced controls
- Responsive Islamic-themed design
- Progressive Web App with offline support
- Express.js backend with API proxy

بسم الله - In the name of Allah"

    echo
    echo "Repository initialized! Now adding GitHub remote..."
    read -p "Do you want to add GitHub origin remote now? (y/n): " add_remote
    if [[ $add_remote =~ ^[Yy]$ ]]; then
        read -p "Enter GitHub repository URL: " new_remote
        git remote add origin "$new_remote"
        echo "Origin remote added successfully!"
        
        echo "Setting main branch and pushing..."
        git branch -M main
        read -p "Push to GitHub now? (y/n): " push_now
        if [[ $push_now =~ ^[Yy]$ ]]; then
            if git push -u origin main; then
                echo "✅ Successfully pushed to GitHub!"
            else
                echo "❌ Push failed. Please check your repository URL and permissions."
            fi
        fi
    fi
    
    echo
    echo "===================================="
    echo "Git repository initialized!"
    echo "===================================="
fi

echo
echo "Git repository setup complete!"
echo
echo "Manual GitHub setup (if needed):"
echo "1. Create a new repository on GitHub"
echo "2. If origin doesn't exist: git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git"
echo "3. If origin exists: git remote set-url origin https://github.com/YOUR_USERNAME/REPO_NAME.git"
echo "4. Push: git push -u origin main"
