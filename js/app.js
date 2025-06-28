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
                        { number: 30, name: "الروم", englishName: "Ar-Rum" },
                        { number: 31, name: "لقمان", englishName: "Luqman" },
                        { number: 32, name: "السجدة", englishName: "As-Sajdah" },
                        { number: 33, name: "الأحزاب", englishName: "Al-Ahzab" },
                        { number: 34, name: "سبأ", englishName: "Saba" },
                        { number: 35, name: "فاطر", englishName: "Fatir" },
                        { number: 36, name: "يس", englishName: "Ya-Sin" },
                        { number: 37, name: "الصافات", englishName: "As-Saffat" },
                        { number: 38, name: "ص", englishName: "Sad" },
                        { number: 39, name: "الزمر", englishName: "Az-Zumar" },
                        { number: 40, name: "غافر", englishName: "Ghafir" },
                        { number: 41, name: "فصلت", englishName: "Fussilat" },
                        { number: 42, name: "الشورى", englishName: "Ash-Shuraa" },
                        { number: 43, name: "الزخرف", englishName: "Az-Zukhruf" },
                        { number: 44, name: "الدخان", englishName: "Ad-Dukhan" },
                        { number: 45, name: "الجاثية", englishName: "Al-Jathiyah" },
                        { number: 46, name: "الأحقاف", englishName: "Al-Ahqaf" },
                        { number: 47, name: "محمد", englishName: "Muhammad" },
                        { number: 48, name: "الفتح", englishName: "Al-Fath" },
                        { number: 49, name: "الحجرات", englishName: "Al-Hujurat" },
                        { number: 50, name: "ق", englishName: "Qaf" },
                        { number: 51, name: "الذاريات", englishName: "Adh-Dhariyat" },
                        { number: 52, name: "الطور", englishName: "At-Tur" },
                        { number: 53, name: "النجم", englishName: "An-Najm" },
                        { number: 54, name: "القمر", englishName: "Al-Qamar" },
                        { number: 55, name: "الرحمن", englishName: "Ar-Rahman" },
                        { number: 56, name: "الواقعة", englishName: "Al-Waqi'ah" },
                        { number: 57, name: "الحديد", englishName: "Al-Hadid" },
                        { number: 58, name: "المجادلة", englishName: "Al-Mujadila" },
                        { number: 59, name: "الحشر", englishName: "Al-Hashr" },
                        { number: 60, name: "الممتحنة", englishName: "Al-Mumtahanah" },
                        { number: 61, name: "الصف", englishName: "As-Saff" },
                        { number: 62, name: "الجمعة", englishName: "Al-Jumu'ah" },
                        { number: 63, name: "المنافقون", englishName: "Al-Munafiqun" },
                        { number: 64, name: "التغابن", englishName: "At-Taghabun" },
                        { number: 65, name: "الطلاق", englishName: "At-Talaq" },
                        { number: 66, name: "التحريم", englishName: "At-Tahrim" },
                        { number: 67, name: "الملك", englishName: "Al-Mulk" },
                        { number: 68, name: "القلم", englishName: "Al-Qalam" },
                        { number: 69, name: "الحاقة", englishName: "Al-Haqqah" },
                        { number: 70, name: "المعارج", englishName: "Al-Ma'arij" },
                        { number: 71, name: "نوح", englishName: "Nuh" },
                        { number: 72, name: "الجن", englishName: "Al-Jinn" },
                        { number: 73, name: "المزمل", englishName: "Al-Muzzammil" },
                        { number: 74, name: "المدثر", englishName: "Al-Muddaththir" },
                        { number: 75, name: "القيامة", englishName: "Al-Qiyamah" },
                        { number: 76, name: "الإنسان", englishName: "Al-Insan" },
                        { number: 77, name: "المرسلات", englishName: "Al-Mursalat" },
                        { number: 78, name: "النبأ", englishName: "An-Naba" },
                        { number: 79, name: "النازعات", englishName: "An-Nazi'at" },
                        { number: 80, name: "عبس", englishName: "Abasa" },
                        { number: 81, name: "التكوير", englishName: "At-Takwir" },
                        { number: 82, name: "الانفطار", englishName: "Al-Infitar" },
                        { number: 83, name: "المطففين", englishName: "Al-Mutaffifin" },
                        { number: 84, name: "الانشقاق", englishName: "Al-Inshiqaq" },
                        { number: 85, name: "البروج", englishName: "Al-Buruj" },
                        { number: 86, name: "الطارق", englishName: "At-Tariq" },
                        { number: 87, name: "الأعلى", englishName: "Al-A'la" },
                        { number: 88, name: "الغاشية", englishName: "Al-Ghashiyah" },
                        { number: 89, name: "الفجر", englishName: "Al-Fajr" },
                        { number: 90, name: "البلد", englishName: "Al-Balad" },
                        { number: 91, name: "الشمس", englishName: "Ash-Shams" },
                        { number: 92, name: "الليل", englishName: "Al-Layl" },
                        { number: 93, name: "الضحى", englishName: "Ad-Duhaa" },
                        { number: 94, name: "الشرح", englishName: "Ash-Sharh" },
                        { number: 95, name: "التين", englishName: "At-Tin" },
                        { number: 96, name: "العلق", englishName: "Al-Alaq" },
                        { number: 97, name: "القدر", englishName: "Al-Qadr" },
                        { number: 98, name: "البينة", englishName: "Al-Bayyinah" },
                        { number: 99, name: "الزلزلة", englishName: "Az-Zalzalah" },
                        { number: 100, name: "العاديات", englishName: "Al-Adiyat" },
                        { number: 101, name: "القارعة", englishName: "Al-Qari'ah" },
                        { number: 102, name: "التكاثر", englishName: "At-Takathur" },
                        { number: 103, name: "العصر", englishName: "Al-Asr" },
                        { number: 104, name: "الهمزة", englishName: "Al-Humazah" },
                        { number: 105, name: "الفيل", englishName: "Al-Fil" },
                        { number: 106, name: "قريش", englishName: "Quraysh" },
                        { number: 107, name: "الماعون", englishName: "Al-Ma'un" },
                        { number: 108, name: "الكوثر", englishName: "Al-Kawthar" },
                        { number: 109, name: "الكافرون", englishName: "Al-Kafirun" },
                        { number: 110, name: "النصر", englishName: "An-Nasr" },
                        { number: 111, name: "المسد", englishName: "Al-Masad" },
                        { number: 112, name: "الإخلاص", englishName: "Al-Ikhlas" },
                        { number: 113, name: "الفلق", englishName: "Al-Falaq" },
                        { number: 114, name: "الناس", englishName: "An-Nas" }
                    ]
                }
            }
        };
    }

    // Static Quran data for popular Surahs when APIs fail
    getStaticSurahContent(surahNumber) {
        console.log(`📖 Getting static content for Surah ${surahNumber}`);
        
        const staticSurahs = {
            1: { // Al-Fatiha
                number: 1,
                name: "الفاتحة",
                englishName: "Al-Fatiha",
                ayahs: [
                    {
                        numberInSurah: 1,
                        text: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
                        english: "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
                        urdu: "اللہ کے نام سے جو نہایت مہربان، رحم کرنے والا ہے"
                    },
                    {
                        numberInSurah: 2,
                        text: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
                        english: "[All] praise is [due] to Allah, Lord of the worlds -",
                        urdu: "سب طرح کی تعریف اللہ ہی کو (سزاوار) ہے جو تمام مخلوقات کا پالنے والا ہے"
                    },
                    {
                        numberInSurah: 3,
                        text: "الرَّحْمَٰنِ الرَّحِيمِ",
                        english: "The Entirely Merciful, the Especially Merciful,",
                        urdu: "نہایت مہربان، رحم کرنے والا"
                    },
                    {
                        numberInSurah: 4,
                        text: "مَالِكِ يَوْمِ الدِّينِ",
                        english: "Sovereign of the Day of Recompense.",
                        urdu: "انصاف کے دن کا حاکم"
                    },
                    {
                        numberInSurah: 5,
                        text: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
                        english: "It is You we worship and You we ask for help.",
                        urdu: "ہم تیری ہی عبادت کرتے ہیں اور تجھی سے مدد چاہتے ہیں"
                    },
                    {
                        numberInSurah: 6,
                        text: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
                        english: "Guide us to the straight path -",
                        urdu: "ہمیں سیدھے رستے کی ہدایت کر"
                    },
                    {
                        numberInSurah: 7,
                        text: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
                        english: "The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.",
                        urdu: "ان لوگوں کا رستہ جن پر تو نے انعام کیا ہے، ان کا نہیں جن پر تیرا غضب نازل ہوا اور نہ (ان کا) جو بھٹک گئے"
                    }
                ]
            },
            112: { // Al-Ikhlas
                number: 112,
                name: "الإخلاص",
                englishName: "Al-Ikhlas",
                ayahs: [
                    {
                        numberInSurah: 1,
                        text: "قُلْ هُوَ اللَّهُ أَحَدٌ",
                        english: "Say, \"He is Allah, [who is] One,",
                        urdu: "کہہ دو کہ وہ اللہ ایک ہے"
                    },
                    {
                        numberInSurah: 2,
                        text: "اللَّهُ الصَّمَدُ",
                        english: "Allah, the Eternal Refuge.",
                        urdu: "اللہ بے نیاز ہے"
                    },
                    {
                        numberInSurah: 3,
                        text: "لَمْ يَلِدْ وَلَمْ يُولَدْ",
                        english: "He neither begets nor is born,",
                        urdu: "نہ اس کی کوئی اولاد ہے اور نہ وہ کسی کی اولاد ہے"
                    },
                    {
                        numberInSurah: 4,
                        text: "وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ",
                        english: "Nor is there to Him any equivalent.\"",
                        urdu: "اور کوئی اس کا ہمسر نہیں"
                    }
                ]
            }
        };
        
        if (staticSurahs[surahNumber]) {
            return {
                data: staticSurahs[surahNumber]
            };
        } else {
            throw new Error(`Static content not available for Surah ${surahNumber}. Only Al-Fatiha (1) and Al-Ikhlas (112) are available offline.`);
        }
    }

    async loadSurahList() {
        try {
            // Surah list is pre-populated in HTML for maximum reliability
            console.log('✅ Surah list already available in HTML - no loading needed');
            
            const surahSelect = document.getElementById('surah-select');
            if (!surahSelect) {
                throw new Error('Surah select element not found');
            }
            
            // Check if options are already loaded (should be 115 total: 1 default + 114 surahs)
            const optionCount = surahSelect.options.length;
            console.log(`✅ Found ${optionCount} options in Surah dropdown`);
            
            if (optionCount >= 114) {
                console.log('✅ All Surahs are available and ready to use');
                this.hideLoading();
                return;
            } else {
                console.log('⚠️ Not all Surahs found, using JavaScript fallback');
                // Fallback to populate via JavaScript if HTML is missing
                throw new Error('HTML Surah list incomplete');
            }
            
        } catch (error) {
            console.error('❌ Error with Surah list:', error);
            
            // Emergency fallback: create basic surah list manually
            console.log('🚨 Using emergency JavaScript fallback');
            const surahSelect = document.getElementById('surah-select');
            if (surahSelect) {
                // Get static data and populate
                const data = this.getStaticSurahData();
                surahSelect.innerHTML = '<option value="">Choose a Surah...</option>';
                
                const surahs = data.data.surahs.references;
                surahs.forEach(surah => {
                    const option = document.createElement('option');
                    option.value = surah.number;
                    option.textContent = `${surah.number}. ${surah.name} - ${surah.englishName}`;
                    surahSelect.appendChild(option);
                });
                console.log(`✅ Emergency fallback loaded ${surahs.length} Surahs`);
            }
        }
        
        this.hideLoading();
    }

    async loadSurah(surahNumber) {
        try {
            this.showLoading(`Loading Surah ${surahNumber}...`);
            this.stopAllAudio();
            
            let surahData;
            
            // Try to use static data first for maximum reliability
            try {
                const staticData = this.getStaticSurahContent(surahNumber);
                console.log(`✅ Using static data for Surah ${surahNumber}`);
                
                this.currentSurah = {
                    number: surahNumber,
                    arabic: staticData.data,
                    english: staticData.data,
                    urdu: staticData.data
                };
                
                this.verses = staticData.data.ayahs.map((ayah, index) => ({
                    number: ayah.numberInSurah,
                    arabic: ayah.text,
                    english: ayah.english || 'Translation not available',
                    urdu: ayah.urdu || 'اردو ترجمہ دستیاب نہیں',
                    audioUrl: null // Audio will be handled separately
                }));
                
            } catch (staticError) {
                console.warn(`Static data not available for Surah ${surahNumber}, trying API...`);
                
                // Fallback to API if static data not available
                const fetchWithRetry = async (url, retries = 2) => {
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
                            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
                        }
                    }
                };
                
                try {
                    // Try API with reduced timeout
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
                    
                } catch (apiError) {
                    console.error('API also failed:', apiError);
                    throw new Error(`Surah ${surahNumber} is not available offline. Please try Al-Fatiha (1) or Al-Ikhlas (112) which are available without internet connection.`);
                }
            }
            
            this.displaySurahInfo();
            this.displayVerses();
            this.hideLoading();
            
            // Enable play all button
            document.getElementById('play-all-btn').disabled = false;
            
        } catch (error) {
            console.error('Error loading Surah:', error);
            let errorMessage = `Failed to load Surah ${surahNumber}.`;
            
            if (error.message.includes('not available offline')) {
                errorMessage = `Surah ${surahNumber} requires internet connection. 
                
Available offline:
• Surah 1 (Al-Fatiha) 
• Surah 112 (Al-Ikhlas)

Please try one of these or check your internet connection.`;
            } else {
                errorMessage += ` Please check your internet connection and try again.`;
            }
            
            this.showError(errorMessage, () => {
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
