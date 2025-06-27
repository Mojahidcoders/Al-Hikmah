// Quran App - Main JavaScript File
class QuranApp {
    constructor() {
        this.currentSurah = null;
        this.currentTranslationMode = 'arabic';
        this.verses = [];
        this.isPlaying = false;
        this.currentPlayingVerse = null;
        this.audioQueue = [];
        this.currentAudioIndex = 0;
        
        // Audio elements
        this.arabicAudio = document.getElementById('arabic-audio');
        this.translationAudio = document.getElementById('translation-audio');
        
        // API Configuration
        // Check if we're running locally or on Netlify
        this.isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        
        if (this.isLocal) {
            // Local development - use backend server
            this.baseURL = window.location.origin;
            this.apiEndpoints = {
                surahs: `${this.baseURL}/api/surahs`,
                arabic: (number) => `${this.baseURL}/api/surah?number=${number}&language=arabic`,
                english: (number) => `${this.baseURL}/api/surah?number=${number}&language=english`,
                urdu: (number) => `${this.baseURL}/api/surah?number=${number}&language=urdu`,
                audio: (ayahNumber) => `${this.baseURL}/api/audio?ayahNumber=${ayahNumber}`,
                health: `${this.baseURL}/api/health`
            };
        } else {
            // Production - use multiple API sources for better reliability
            this.baseURL = '';
            this.apiEndpoints = {
                surahs: 'https://api.alquran.cloud/v1/meta',
                arabic: (number) => `https://api.alquran.cloud/v1/surah/${number}`,
                english: (number) => `https://api.alquran.cloud/v1/surah/${number}/en.asad`,
                urdu: (number) => `https://api.alquran.cloud/v1/surah/${number}/ur.jalandhry`,
                audio: (ayahNumber) => `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayahNumber}.mp3`,
                health: 'https://api.alquran.cloud/v1/meta'
            };
            
            // Backup API endpoints
            this.backupEndpoints = {
                surahs: 'https://api.alquran.cloud/v1/meta',
                arabic: (number) => `https://api.alquran.cloud/v1/surah/${number}/ar.alafasy`,
                english: (number) => `https://api.alquran.cloud/v1/surah/${number}/en.pickthall`,
                urdu: (number) => `https://api.alquran.cloud/v1/surah/${number}/ur.ahmedali`
            };
        }
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        
        // Add environment indicator
        const envIndicator = document.createElement('div');
        envIndicator.id = 'env-indicator';
        envIndicator.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(46, 125, 50, 0.8);
            color: white;
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 10000;
            font-family: monospace;
        `;
        
        const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        envIndicator.textContent = isLocal ? 'Local Dev' : 'Production';
        document.body.appendChild(envIndicator);
        
        // Log API endpoints for debugging
        console.log('🕌 Al-Hikmah Academy - Quran Section');
        console.log('Environment:', isLocal ? 'Local Development' : 'Production');
        console.log('API Endpoints:', this.apiEndpoints);
        
        await this.loadSurahList();
        this.showSection('controls');
    }

    setupEventListeners() {
        // Surah selection
        document.getElementById('surah-select').addEventListener('change', (e) => {
            if (e.target.value) {
                this.loadSurah(parseInt(e.target.value));
            }
        });

        // Translation mode toggle
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setTranslationMode(e.target.dataset.mode);
            });
        });

        // Audio controls
        document.getElementById('play-all-btn').addEventListener('click', () => {
            this.playAllVerses();
        });

        document.getElementById('stop-audio-btn').addEventListener('click', () => {
            this.stopAllAudio();
        });

        // Global player controls
        document.getElementById('play-pause-btn').addEventListener('click', () => {
            this.togglePlayPause();
        });

        document.getElementById('prev-verse-btn').addEventListener('click', () => {
            this.playPreviousVerse();
        });

        document.getElementById('next-verse-btn').addEventListener('click', () => {
            this.playNextVerse();
        });

        // Retry button
        document.getElementById('retry-btn').addEventListener('click', () => {
            this.retryLastAction();
        });

        // Audio event listeners
        this.arabicAudio.addEventListener('ended', () => {
            this.onAudioEnded();
        });

        this.arabicAudio.addEventListener('error', (e) => {
            this.handleAudioError(e);
        });

        this.arabicAudio.addEventListener('timeupdate', () => {
            this.updateProgress();
        });

        // Progress bar click
        document.querySelector('.progress-bar').addEventListener('click', (e) => {
            this.seekAudio(e);
        });
    }

    // API Helper method with fallback support
    async fetchWithFallback(endpoint, fallbackEndpoint = null) {
        try {
            console.log('🔗 Trying primary endpoint:', endpoint);
            
            const response = await fetch(endpoint, {
                method: 'GET',
                mode: 'cors',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            console.log('📡 Primary response status:', response.status, response.statusText);
            
            if (!response.ok) {
                throw new Error(`Primary API failed: HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('✅ Primary API success:', data);
            return data;
            
        } catch (primaryError) {
            console.warn('⚠️ Primary API failed:', primaryError.message);
            
            // Try backup endpoints if available
            if (this.backupEndpoints && !this.isLocal) {
                try {
                    // Try backup Surah list endpoint
                    let backupUrl = fallbackEndpoint;
                    if (endpoint.includes('meta')) {
                        backupUrl = this.backupEndpoints.surahs;
                    }
                    
                    console.log('🔗 Trying backup endpoint:', backupUrl);
                    
                    const backupResponse = await fetch(backupUrl, {
                        method: 'GET',
                        mode: 'cors',
                        headers: {
                            'Accept': 'application/json'
                        }
                    });
                    
                    console.log('📡 Backup response status:', backupResponse.status, backupResponse.statusText);
                    
                    if (!backupResponse.ok) {
                        throw new Error(`Backup API failed: HTTP ${backupResponse.status}: ${backupResponse.statusText}`);
                    }
                    
                    const backupData = await backupResponse.json();
                    console.log('✅ Backup API success:', backupData);
                    return backupData;
                    
                } catch (backupError) {
                    console.error('❌ Both primary and backup APIs failed');
                    console.error('Primary error:', primaryError.message);
                    console.error('Backup error:', backupError.message);
                    
                    // Return static data as last resort
                    return this.getStaticSurahData();
                }
            } else {
                // For local development or when no backup available
                throw primaryError;
            }
        }
    }

    // Static fallback data for when all APIs fail
    getStaticSurahData() {
        console.log('📊 Using static fallback data');
        return {
            data: {
                surahs: {
                    references: [
                        { number: 1, name: "الفاتحة", englishName: "Al-Fatiha" },
                        { number: 2, name: "البقرة", englishName: "Al-Baqarah" },
                        { number: 3, name: "آل عمران", englishName: "Ali 'Imran" },
                        { number: 4, name: "النساء", englishName: "An-Nisa" },
                        { number: 5, name: "المائدة", englishName: "Al-Ma'idah" },
                        { number: 6, name: "الأنعام", englishName: "Al-An'am" },
                        { number: 7, name: "الأعراف", englishName: "Al-A'raf" },
                        { number: 8, name: "الأنفال", englishName: "Al-Anfal" },
                        { number: 9, name: "التوبة", englishName: "At-Tawbah" },
                        { number: 10, name: "يونس", englishName: "Yunus" },
                        { number: 11, name: "هود", englishName: "Hud" },
                        { number: 12, name: "يوسف", englishName: "Yusuf" },
                        { number: 13, name: "الرعد", englishName: "Ar-Ra'd" },
                        { number: 14, name: "إبراهيم", englishName: "Ibrahim" },
                        { number: 15, name: "الحجر", englishName: "Al-Hijr" },
                        { number: 16, name: "النحل", englishName: "An-Nahl" },
                        { number: 17, name: "الإسراء", englishName: "Al-Isra" },
                        { number: 18, name: "الكهف", englishName: "Al-Kahf" },
                        { number: 19, name: "مريم", englishName: "Maryam" },
                        { number: 20, name: "طه", englishName: "Taha" },
                        { number: 21, name: "الأنبياء", englishName: "Al-Anbya" },
                        { number: 22, name: "الحج", englishName: "Al-Hajj" },
                        { number: 23, name: "المؤمنون", englishName: "Al-Mu'minun" },
                        { number: 24, name: "النور", englishName: "An-Nur" },
                        { number: 25, name: "الفرقان", englishName: "Al-Furqan" },
                        { number: 26, name: "الشعراء", englishName: "Ash-Shu'ara" },
                        { number: 27, name: "النمل", englishName: "An-Naml" },
                        { number: 28, name: "القصص", englishName: "Al-Qasas" },
                        { number: 29, name: "العنكبوت", englishName: "Al-'Ankabut" },
                        { number: 30, name: "الروم", englishName: "Ar-Rum" }
                        // Add more Surahs as needed - this is just a fallback
                    ]
                }
            }
        };
    }

    async loadSurahList() {
        try {
            this.showLoading('Loading Surah list...');
            
            let data;
            try {
                data = await this.fetchWithFallback(this.apiEndpoints.surahs);
            } catch (apiError) {
                console.warn('All APIs failed, using static data:', apiError.message);
                data = this.getStaticSurahData();
            }
            
            const surahSelect = document.getElementById('surah-select');
            
            // Clear existing options except the first one
            surahSelect.innerHTML = '<option value="">Choose a Surah...</option>';
            
            // Handle direct API response format
            let surahs;
            if (this.isLocal && data && data.data && data.data.surahs && data.data.surahs.references) {
                // Local API format
                surahs = data.data.surahs.references;
            } else if (data && data.data && Array.isArray(data.data)) {
                // Direct AlQuran.cloud API format
                surahs = data.data.map(surah => ({
                    number: surah.number,
                    name: surah.name,
                    englishName: surah.englishName
                }));
            } else {
                throw new Error('Invalid data structure received from API');
            }
            
            if (surahs && surahs.length > 0) {
                surahs.forEach(surah => {
                    const option = document.createElement('option');
                    option.value = surah.number;
                    option.textContent = `${surah.number}. ${surah.name} - ${surah.englishName}`;
                    surahSelect.appendChild(option);
                });
                console.log(`✅ Loaded ${surahs.length} Surahs`);
            } else {
                throw new Error('No Surahs found in API response');
            }
            
            this.hideLoading();
        } catch (error) {
            console.error('❌ Error loading Surah list:', error);
            const errorMessage = `Failed to load Surah list: ${error.message}. 
                                  API endpoint: ${this.apiEndpoints.surahs}
                                  Environment: ${window.location.hostname === 'localhost' ? 'Local' : 'Production'}`;
            this.showError(errorMessage, () => {
                this.loadSurahList();
            });
        }
    }

    async loadSurah(surahNumber) {
        try {
            this.showLoading(`Loading Surah ${surahNumber}...`);
            this.stopAllAudio();
            
            // Fetch with proper headers and error handling
            const fetchWithRetry = async (url, retries = 3) => {
                for (let i = 0; i < retries; i++) {
                    try {
                        const response = await fetch(url, {
                            method: 'GET',
                            headers: {
                                'Accept': 'application/json',
                                'Content-Type': 'application/json'
                            }
                        });
                        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                        return await response.json();
                    } catch (error) {
                        if (i === retries - 1) throw error;
                        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1))); // Progressive delay
                    }
                }
            };
            
            // Load Arabic text, English translation, and Urdu translation in parallel
            const [arabicData, englishData, urduData] = await Promise.all([
                fetchWithRetry(this.apiEndpoints.arabic(surahNumber)),
                fetchWithRetry(this.apiEndpoints.english(surahNumber)),
                fetchWithRetry(this.apiEndpoints.urdu(surahNumber))
            ]);
            
            this.currentSurah = {
                number: surahNumber,
                arabic: arabicData.data,
                english: englishData.data,
                urdu: urduData.data
            };
            
            this.verses = this.currentSurah.arabic.ayahs.map((ayah, index) => ({
                number: ayah.numberInSurah,
                arabic: ayah.text,
                english: this.currentSurah.english.ayahs[index]?.text || 'Translation not available',
                urdu: this.currentSurah.urdu.ayahs[index]?.text || 'اردو ترجمہ دستیاب نہیں',
                audioUrl: typeof this.apiEndpoints.audio === 'function' 
                    ? this.apiEndpoints.audio(ayah.number)
                    : this.apiEndpoints.audio
            }));
            
            this.displaySurahInfo();
            this.displayVerses();
            this.hideLoading();
            
            // Enable play all button
            document.getElementById('play-all-btn').disabled = false;
            
        } catch (error) {
            console.error('Error loading Surah:', error);
            this.showError(`Failed to load Surah ${surahNumber}. Please check your internet connection and try again.`, () => {
                this.loadSurah(surahNumber);
            });
        }
    }

    displaySurahInfo() {
        const surahInfo = this.currentSurah.arabic;
        
        document.getElementById('surah-name-arabic').textContent = surahInfo.name;
        document.getElementById('surah-name-english').textContent = surahInfo.englishName;
        document.getElementById('surah-type').textContent = `${surahInfo.revelationType}`;
        document.getElementById('surah-verses').textContent = `${surahInfo.numberOfAyahs} Verses`;
        
        this.showSection('surah-info');
    }

    displayVerses() {
        const versesList = document.getElementById('verses-list');
        versesList.innerHTML = '';
        
        this.verses.forEach((verse, index) => {
            const verseElement = this.createVerseElement(verse, index);
            versesList.appendChild(verseElement);
        });
        
        this.showSection('verses-container');
    }

    createVerseElement(verse, index) {
        const verseDiv = document.createElement('div');
        verseDiv.className = 'verse-item';
        verseDiv.dataset.verseIndex = index;
        
        verseDiv.innerHTML = `
            <div class="verse-header">
                <div class="verse-number">${verse.number}</div>
                <div class="verse-audio-controls">
                    <button class="verse-audio-btn play-arabic" data-verse="${index}" title="Play Arabic">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="verse-audio-btn play-translation" data-verse="${index}" title="Play Translation" 
                            style="display: ${this.currentTranslationMode === 'arabic' ? 'none' : 'inline-block'};">
                        <i class="fas fa-volume-up"></i>
                    </button>
                </div>
            </div>
            <div class="verse-arabic">${verse.arabic}</div>
            <div class="verse-translation ${this.currentTranslationMode === 'urdu' ? 'urdu' : ''}" 
                 style="display: ${this.currentTranslationMode === 'arabic' ? 'none' : 'block'}">
                ${this.currentTranslationMode === 'english' ? verse.english : verse.urdu}
            </div>
        `;
        
        // Add event listeners for verse audio buttons
        const playArabicBtn = verseDiv.querySelector('.play-arabic');
        const playTranslationBtn = verseDiv.querySelector('.play-translation');
        
        playArabicBtn.addEventListener('click', () => {
            this.playVerseAudio(index, 'arabic');
        });
        
        playTranslationBtn.addEventListener('click', () => {
            this.playVerseAudio(index, 'translation');
        });
        
        return verseDiv;
    }

    setTranslationMode(mode) {
        this.currentTranslationMode = mode;
        
        // Update toggle buttons
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
        
        // Update verse display if verses are loaded
        if (this.verses.length > 0) {
            this.displayVerses();
        }
    }

    async playVerseAudio(verseIndex, type = 'arabic') {
        try {
            const verse = this.verses[verseIndex];
            
            if (type === 'arabic') {
                this.arabicAudio.src = verse.audioUrl;
                this.arabicAudio.currentTime = 0;
                
                // Update UI
                this.highlightVerse(verseIndex);
                this.updateNowPlaying(verseIndex);
                this.showGlobalPlayer();
                
                await this.arabicAudio.play();
                this.isPlaying = true;
                this.currentPlayingVerse = verseIndex;
                this.updatePlayButton(true);
                
            } else if (type === 'translation') {
                // Translation audio implementation
                // Using text-to-speech for translation audio since dedicated translation audio APIs are limited
                await this.playTranslationAudio(verse, verseIndex);
            }
            
        } catch (error) {
            this.handleAudioError(error);
        }
    }

    async playAllVerses() {
        if (this.verses.length === 0) return;
        
        this.audioQueue = this.verses.map((_, index) => index);
        this.currentAudioIndex = 0;
        await this.playVerseAudio(this.audioQueue[this.currentAudioIndex]);
    }

    async playNextVerse() {
        if (this.audioQueue.length === 0) return;
        
        this.currentAudioIndex++;
        if (this.currentAudioIndex < this.audioQueue.length) {
            await this.playVerseAudio(this.audioQueue[this.currentAudioIndex]);
        } else {
            this.stopAllAudio();
        }
    }

    async playPreviousVerse() {
        if (this.audioQueue.length === 0) return;
        
        this.currentAudioIndex--;
        if (this.currentAudioIndex >= 0) {
            await this.playVerseAudio(this.audioQueue[this.currentAudioIndex]);
        } else {
            this.currentAudioIndex = 0;
        }
    }

    togglePlayPause() {
        if (this.isPlaying) {
            this.arabicAudio.pause();
            this.isPlaying = false;
            this.updatePlayButton(false);
        } else if (this.currentPlayingVerse !== null) {
            this.arabicAudio.play();
            this.isPlaying = true;
            this.updatePlayButton(true);
        }
    }

    stopAllAudio() {
        this.arabicAudio.pause();
        this.arabicAudio.currentTime = 0;
        this.translationAudio.pause();
        this.translationAudio.currentTime = 0;
        
        // Stop speech synthesis if active
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        
        this.isPlaying = false;
        this.currentPlayingVerse = null;
        this.audioQueue = [];
        this.currentAudioIndex = 0;
        
        this.clearHighlights();
        this.hideGlobalPlayer();
        this.updatePlayButton(false);
    }

    highlightVerse(index) {
        this.clearHighlights();
        const verseElement = document.querySelector(`[data-verse-index="${index}"]`);
        if (verseElement) {
            verseElement.classList.add('playing');
            verseElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    clearHighlights() {
        document.querySelectorAll('.verse-item').forEach(item => {
            item.classList.remove('playing');
        });
    }

    updateNowPlaying(verseIndex, type = 'arabic') {
        const verse = this.verses[verseIndex];
        const audioType = type === 'translation' ? 'Translation' : 'Arabic';
        document.getElementById('now-playing-text').textContent = 
            `Now Playing: Verse ${verse.number} (${audioType})`;
    }

    updatePlayButton(isPlaying) {
        const playPauseBtn = document.getElementById('play-pause-btn');
        const icon = playPauseBtn.querySelector('i');
        
        if (isPlaying) {
            icon.className = 'fas fa-pause';
        } else {
            icon.className = 'fas fa-play';
        }
    }

    updateProgress() {
        if (this.arabicAudio.duration > 0) {
            const progress = (this.arabicAudio.currentTime / this.arabicAudio.duration) * 100;
            document.getElementById('progress-fill').style.width = `${progress}%`;
        }
    }

    seekAudio(event) {
        if (this.arabicAudio.duration > 0) {
            const progressBar = event.currentTarget;
            const rect = progressBar.getBoundingClientRect();
            const percent = (event.clientX - rect.left) / rect.width;
            this.arabicAudio.currentTime = percent * this.arabicAudio.duration;
        }
    }

    onAudioEnded() {
        if (this.audioQueue.length > 0) {
            this.playNextVerse();
        } else {
            this.stopAllAudio();
        }
    }

    handleAudioError(error) {
        console.error('Audio error:', error);
        this.showMessage('Audio playback error. Please try again.', 'error');
        this.stopAllAudio();
    }

    showSection(sectionId) {
        document.getElementById(sectionId).classList.remove('hidden');
    }

    hideSection(sectionId) {
        document.getElementById(sectionId).classList.add('hidden');
    }

    showLoading(message = 'Loading...') {
        document.getElementById('loading-state').classList.remove('hidden');
        document.querySelector('#loading-state p').textContent = message;
        this.hideSection('error-state');
    }

    hideLoading() {
        this.hideSection('loading-state');
    }

    showError(message, retryCallback = null) {
        document.getElementById('error-message').textContent = message;
        document.getElementById('error-state').classList.remove('hidden');
        this.hideLoading();
        
        if (retryCallback) {
            this.retryCallback = retryCallback;
        }
    }

    retryLastAction() {
        this.hideSection('error-state');
        if (this.retryCallback) {
            this.retryCallback();
        }
    }

    showGlobalPlayer() {
        document.getElementById('global-audio-player').classList.remove('hidden');
    }

    hideGlobalPlayer() {
        document.getElementById('global-audio-player').classList.add('hidden');
    }

    showMessage(message, type = 'info') {
        // Create a toast notification
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        
        // Add toast styles
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#f44336' : '#4caf50'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            font-weight: 500;
            animation: slideInRight 0.3s ease-out;
        `;
        
        document.body.appendChild(toast);
        
        // Remove toast after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease-in forwards';
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }

    async playTranslationAudio(verse, verseIndex) {
        try {
            // Get translation text based on current mode
            const translationText = this.currentTranslationMode === 'english' ? verse.english : verse.urdu;
            
            // Check if Web Speech API is supported
            if ('speechSynthesis' in window) {
                // Stop any ongoing speech
                window.speechSynthesis.cancel();
                
                // Create speech synthesis utterance
                const utterance = new SpeechSynthesisUtterance(translationText);
                
                // Configure voice settings based on translation mode
                if (this.currentTranslationMode === 'english') {
                    utterance.lang = 'en-US';
                    utterance.rate = 0.8;
                } else if (this.currentTranslationMode === 'urdu') {
                    utterance.lang = 'ur-PK';
                    utterance.rate = 0.7;
                }
                
                utterance.volume = 0.8;
                utterance.pitch = 1.0;
                
                // Update UI
                this.highlightVerse(verseIndex);
                this.updateNowPlaying(verseIndex, 'translation');
                this.showGlobalPlayer();
                
                // Set up event handlers
                utterance.onstart = () => {
                    this.isPlaying = true;
                    this.currentPlayingVerse = verseIndex;
                    this.updatePlayButton(true);
                };
                
                utterance.onend = () => {
                    this.onAudioEnded();
                };
                
                utterance.onerror = (error) => {
                    console.error('Speech synthesis error:', error);
                    this.showMessage('Translation audio error. Please try again.', 'error');
                    this.stopAllAudio();
                };
                
                // Start speech synthesis
                window.speechSynthesis.speak(utterance);
                
            } else {
                // Fallback: Show message if Web Speech API is not supported
                this.showMessage('Translation audio is not supported in this browser. Please try using Chrome, Firefox, or Safari.', 'error');
            }
            
        } catch (error) {
            console.error('Translation audio error:', error);
            this.showMessage('Translation audio feature encountered an error.', 'error');
        }
    }
}

// CSS for toast animations
const toastStyles = document.createElement('style');
toastStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(toastStyles);

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new QuranApp();
});

// Service Worker registration for offline functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
