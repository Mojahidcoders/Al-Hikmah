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

echo "Starting the Al-Hikmah Academy Quran application..."
npm start
