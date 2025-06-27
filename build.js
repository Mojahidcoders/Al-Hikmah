#!/usr/bin/env node

// Simple build script for Vercel deployment
// This ensures the public directory is recognized as the build output

const fs = require('fs');
const path = require('path');

console.log('🚀 Building Al-Hikmah Academy Quran Section...');

// Ensure public directory exists
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
}

// Copy static files if they don't exist in public
const filesToCopy = [
    { src: 'index.html', dest: 'public/index.html' },
    { src: 'manifest.json', dest: 'public/manifest.json' },
    { src: 'sw.js', dest: 'public/sw.js' },
    { src: 'css/styles.css', dest: 'public/css/styles.css' },
    { src: 'js/app.js', dest: 'public/js/app.js' }
];

// Ensure subdirectories exist
const dirsToCreate = ['public/css', 'public/js'];
dirsToCreate.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

filesToCopy.forEach(({ src, dest }) => {
    if (fs.existsSync(src)) {
        if (!fs.existsSync(dest)) {
            fs.copyFileSync(src, dest);
            console.log(`✅ Copied ${src} to ${dest}`);
        } else {
            console.log(`ℹ️  ${dest} already exists, skipping`);
        }
    } else {
        console.log(`⚠️  Source file ${src} not found`);
    }
});

console.log('✨ Build completed! Public directory is ready for deployment.');
console.log('📁 Static files are in /public directory');
console.log('🔧 API functions are in /api directory');
