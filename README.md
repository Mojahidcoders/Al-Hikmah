# Al-Hikmah Academy - Quran Section

A comprehensive and elegant Quran section for the Al-Hikmah Academy website featuring Arabic text, multiple translations, and audio recitation capabilities.

## 🌟 Features

### Core Functionality
- **📖 Complete Quran**: All 114 Surahs with full Arabic text
- **🌍 Multiple Translations**: English and Urdu translations
- **🔊 Audio Recitation**: High-quality Arabic audio by renowned reciters
- **📱 Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **⚡ Fast Loading**: Optimized performance with caching
- **🌐 Offline Support**: Progressive Web App with offline capabilities

### User Interface
- **🎨 Beautiful Design**: Modern, Islamic-themed interface
- **🎯 Easy Navigation**: Intuitive Surah selection dropdown
- **🔄 Translation Toggle**: Switch between Arabic only, Arabic + English, or Arabic + Urdu
- **🎵 Audio Controls**: Play individual verses or continuous recitation
- **📍 Progress Tracking**: Visual progress indicator for audio playback
- **🔍 Verse Highlighting**: Currently playing verse is highlighted

### Technical Features
- **⚙️ API Integration**: Uses AlQuran Cloud API for reliable data
- **🔄 Caching**: Smart caching for improved performance
- **📶 Error Handling**: Graceful error handling and retry mechanisms
- **🎧 Audio Management**: Advanced audio controls with queue management
- **💾 Local Storage**: Saves user preferences
- **🔧 Service Worker**: Background sync and offline functionality

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. **Clone or download the project files**
2. **Navigate to the project directory**
   ```bash
   cd Quran
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Open your browser**
   - Visit: `http://localhost:3000`

### Development Mode
For development with auto-restart:
```bash
npm run dev
```

## 📁 Project Structure

```
Quran/
├── index.html              # Main HTML file
├── css/
│   └── styles.css          # Comprehensive styling
├── js/
│   └── app.js              # Main application logic
├── server/
│   └── server.js           # Express.js backend server
├── sw.js                   # Service Worker for offline support
├── manifest.json           # PWA manifest
├── package.json            # Node.js dependencies
├── .github/                # GitHub workflows and templates
│   ├── workflows/
│   │   └── ci.yml          # CI/CD pipeline
│   └── ISSUE_TEMPLATE/     # Issue templates
├── .gitignore              # Git ignore rules
├── LICENSE                 # MIT License with Islamic disclaimer
├── CONTRIBUTING.md         # Contribution guidelines
└── README.md              # This file
```

## 🐙 GitHub Repository Setup

### 1. Create Repository on GitHub
1. Go to [GitHub](https://github.com) and create a new repository
2. Name it: `al-hikmah-academy-quran`
3. Add description: "Complete Quran section for Al-Hikmah Academy with Arabic text, translations, and audio recitation"
4. Choose "Public" for open-source sharing
5. Don't initialize with README (we already have one)

### 2. Initialize Local Git Repository
```bash
# Navigate to project directory
cd "c:\Users\Acer\OneDrive\Desktop\Quran"

# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "🕌 Initial commit: Al-Hikmah Academy Quran Section

✨ Features:
- Complete Quran with 114 Surahs
- Arabic text with English & Urdu translations
- Audio recitation with advanced controls
- Responsive Islamic-themed design
- Progressive Web App with offline support
- Express.js backend with API proxy

بسم الله - In the name of Allah"

# Add GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/al-hikmah-academy-quran.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 3. Repository Configuration
After pushing to GitHub, configure the repository:

1. **Enable Issues**: Go to Settings → Features → Enable Issues
2. **Enable Discussions**: Go to Settings → Features → Enable Discussions
3. **Configure Pages**: Go to Settings → Pages → Deploy from branch (main)
4. **Add Topics**: Add topics like `quran`, `islamic-education`, `javascript`, `nodejs`, `pwa`
5. **Create Description**: Add the project description and website URL

### 4. GitHub Features Setup

#### Branch Protection Rules
```bash
# Create develop branch for ongoing development
git checkout -b develop
git push origin develop

# Set main branch as default and protected
# (Do this in GitHub Settings → Branches)
```

#### Repository Templates
The repository includes:
- 🐛 **Bug Report Template**: For reporting issues
- ✨ **Feature Request Template**: For suggesting improvements  
- 🌍 **Translation Issue Template**: For translation corrections
- 🔄 **CI/CD Pipeline**: Automated testing and verification

### 5. Collaboration Setup

#### For Contributors
```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/YOUR_USERNAME/al-hikmah-academy-quran.git
cd al-hikmah-academy-quran

# Add upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/al-hikmah-academy-quran.git

# Create feature branch
git checkout -b feature/new-feature

# Make changes, commit, and push
git push origin feature/new-feature

# Create Pull Request on GitHub
```

#### For Maintainers
- Review Pull Requests with Islamic compliance in mind
- Ensure all translations are verified by qualified scholars
- Maintain code quality and performance standards
- Keep the project aligned with Islamic educational goals

### 6. Release Management
```bash
# Create and push tags for releases
git tag -a v1.0.0 -m "🕌 Al-Hikmah Academy Quran v1.0.0

🌟 Initial release with:
- Complete Quran interface
- Multi-language translations  
- Audio recitation
- PWA support

الحمد لله - All praise to Allah"

git push origin v1.0.0
```

### 7. Troubleshooting Git Issues

#### Common Error: "remote origin already exists"
If you encounter this error, use our troubleshooting scripts:

**Windows:**
```bash
# Run the Git troubleshooting helper
./git-fix.bat
```

**Linux/Mac:**
```bash
# Run the Git troubleshooting helper
./git-fix.sh
```

#### Manual Fix for Remote Origin Issues:
```bash
# Check current remotes
git remote -v

# If origin exists but is wrong, update it:
git remote set-url origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# If no origin exists, add it:
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# If origin exists but you want to remove it:
git remote remove origin
# Then add the correct one:
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
```

#### Force Push (use with caution):
```bash
# If you need to overwrite remote repository
git push -u origin main --force
```

**⚠️ Warning:** Force push will overwrite the remote repository. Only use this if you're sure about the consequences.

## 🎯 How to Use

### 1. Select a Surah
- Use the dropdown menu to choose from 114 Surahs
- Each option shows the Surah number, Arabic name, and English name

### 2. Choose Translation Mode
- **Arabic Only**: Shows only Arabic text
- **Arabic + English**: Shows Arabic with English translation
- **Arabic + Urdu**: Shows Arabic with Urdu translation

### 3. Audio Features
- **Play Individual Verses**: Click the play button next to any verse
- **Play All Verses**: Use "Play All" to listen to the entire Surah
- **Audio Controls**: Use the global player for play/pause, next/previous
- **Progress Bar**: Click to seek to any position in the current verse

### 4. Navigation
- Verses are numbered and easily identifiable
- Currently playing verse is highlighted
- Smooth scrolling keeps the active verse in view

## 🔧 Configuration

### API Endpoints
The application uses the following APIs:
- **Quran Text**: `api.alquran.cloud/v1`
- **Audio Files**: `cdn.islamic.network/quran/audio`

### Customization Options
- **Reciters**: Can be changed in the backend configuration
- **Translation Sources**: Multiple translation sources available
- **Styling**: Easy to customize through CSS variables
- **Audio Quality**: Different bitrates available (64, 128, 192 kbps)

## 🌐 Browser Support

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 11+
- ✅ Edge 79+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 📱 Progressive Web App (PWA)

This application can be installed as a PWA:
1. Visit the site in a supported browser
2. Look for the "Install" prompt or "Add to Home Screen"
3. Enjoy offline access to cached content

## 🔒 Privacy & Data

- **No User Data Collection**: The app doesn't collect personal information
- **API Calls**: Only made to fetch Quran content
- **Local Storage**: Used only for user preferences and caching
- **No Analytics**: No tracking or analytics implemented

## 🤝 Contributing

Contributions are welcome! Areas for improvement:
- Additional translation languages
- More reciter options
- Enhanced audio features
- UI/UX improvements
- Performance optimizations

## 📞 Support

For issues or questions:
- Check the browser console for error messages
- Ensure stable internet connection for initial load
- Clear browser cache if experiencing issues
- Verify that JavaScript is enabled

## 🏆 Credits

- **Quran Data**: [AlQuran Cloud API](https://alquran.cloud/)
- **Audio Recitation**: Islamic Network CDN
- **Fonts**: Google Fonts (Poppins, Amiri)
- **Icons**: Font Awesome
- **Design**: Custom Islamic-themed design

## 📄 License

This project is open source and available under the MIT License.

## 🕌 About Al-Hikmah Academy

Al-Hikmah Academy is dedicated to providing quality Islamic education through modern technology. This Quran section represents our commitment to making Islamic knowledge accessible to everyone.

---

**May Allah (SWT) bless this effort and make it a source of benefit for the Ummah. Ameen.**
