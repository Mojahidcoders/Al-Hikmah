// Simple test script to verify the installation
const fs = require('fs');
const path = require('path');

console.log('🕌 Al-Hikmah Academy - Quran Section');
console.log('===================================');
console.log('Running installation verification...\n');

// Check if all required files exist
const requiredFiles = [
    'index.html',
    'css/styles.css',
    'js/app.js',
    'server/server.js',
    'package.json',
    'manifest.json',
    'sw.js',
    'README.md'
];

let allFilesExist = true;

console.log('📁 Checking required files:');
requiredFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    const exists = fs.existsSync(filePath);
    console.log(`   ${exists ? '✅' : '❌'} ${file}`);
    if (!exists) allFilesExist = false;
});

console.log('\n📦 Checking package.json:');
try {
    const packageJson = require('./package.json');
    console.log(`   ✅ Name: ${packageJson.name}`);
    console.log(`   ✅ Version: ${packageJson.version}`);
    console.log(`   ✅ Dependencies: ${Object.keys(packageJson.dependencies).length} found`);
} catch (error) {
    console.log('   ❌ Error reading package.json');
    allFilesExist = false;
}

console.log('\n🔧 Checking Node.js modules:');
const requiredModules = ['express', 'cors', 'axios'];
requiredModules.forEach(module => {
    try {
        require.resolve(module);
        console.log(`   ✅ ${module}`);
    } catch (error) {
        console.log(`   ❌ ${module} - Run 'npm install'`);
        allFilesExist = false;
    }
});

console.log('\n🌐 Testing server startup:');
try {
    const express = require('express');
    const app = express();
    const server = app.listen(0, () => {
        const port = server.address().port;
        console.log(`   ✅ Server can start on port ${port}`);
        server.close();
        
        console.log('\n🎉 Installation verification complete!');
        if (allFilesExist) {
            console.log('✅ All systems ready! You can start the application with: npm start');
        } else {
            console.log('❌ Some issues found. Please check the errors above.');
        }
    });
} catch (error) {
    console.log('   ❌ Server startup failed:', error.message);
}
