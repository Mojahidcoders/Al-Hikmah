const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../')));

// Cache for API responses
const cache = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Helper function to get cached data or fetch new data
async function getCachedData(key, fetchFunction) {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
    }
    
    const data = await fetchFunction();
    cache.set(key, { data, timestamp: Date.now() });
    return data;
}

// API Routes

// Get Surah list
app.get('/api/surahs', async (req, res) => {
    try {
        const data = await getCachedData('surahs', async () => {
            const response = await axios.get('https://api.alquran.cloud/v1/meta');
            return response.data;
        });
        
        res.json(data);
    } catch (error) {
        console.error('Error fetching surahs:', error);
        res.status(500).json({ error: 'Failed to fetch surah list' });
    }
});

// Get specific Surah with Arabic text and audio
app.get('/api/surah/:number/arabic', async (req, res) => {
    try {
        const surahNumber = req.params.number;
        const data = await getCachedData(`surah-${surahNumber}-arabic`, async () => {
            const response = await axios.get(`https://api.alquran.cloud/v1/surah/${surahNumber}/ar.alafasy`);
            return response.data;
        });
        
        res.json(data);
    } catch (error) {
        console.error('Error fetching arabic surah:', error);
        res.status(500).json({ error: 'Failed to fetch Arabic text' });
    }
});

// Get Surah with English translation
app.get('/api/surah/:number/english', async (req, res) => {
    try {
        const surahNumber = req.params.number;
        const data = await getCachedData(`surah-${surahNumber}-english`, async () => {
            const response = await axios.get(`https://api.alquran.cloud/v1/surah/${surahNumber}/en.asad`);
            return response.data;
        });
        
        res.json(data);
    } catch (error) {
        console.error('Error fetching english translation:', error);
        res.status(500).json({ error: 'Failed to fetch English translation' });
    }
});

// Get Surah with Urdu translation
app.get('/api/surah/:number/urdu', async (req, res) => {
    try {
        const surahNumber = req.params.number;
        const data = await getCachedData(`surah-${surahNumber}-urdu`, async () => {
            const response = await axios.get(`https://api.alquran.cloud/v1/surah/${surahNumber}/ur.jalandhry`);
            return response.data;
        });
        
        res.json(data);
    } catch (error) {
        console.error('Error fetching urdu translation:', error);
        res.status(500).json({ error: 'Failed to fetch Urdu translation' });
    }
});

// Proxy audio files to handle CORS
app.get('/api/audio/:ayahNumber', async (req, res) => {
    try {
        const ayahNumber = req.params.ayahNumber;
        const audioUrl = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayahNumber}.mp3`;
        
        const response = await axios.get(audioUrl, {
            responseType: 'stream'
        });
        
        res.set({
            'Content-Type': 'audio/mpeg',
            'Cache-Control': 'public, max-age=86400' // Cache for 24 hours
        });
        
        response.data.pipe(res);
    } catch (error) {
        console.error('Error proxying audio:', error);
        res.status(500).json({ error: 'Failed to fetch audio' });
    }
});

// Get reciter list
app.get('/api/reciters', async (req, res) => {
    try {
        const reciters = [
            { id: 'ar.alafasy', name: 'Mishary Rashid Alafasy', language: 'Arabic' },
            { id: 'ar.hudhaifi', name: 'Ali Al-Hudhaifi', language: 'Arabic' },
            { id: 'ar.minshawi', name: 'Mohamed Siddiq El-Minshawi', language: 'Arabic' },
            { id: 'ar.abdulbasit', name: 'Abdul Basit Abdul Samad', language: 'Arabic' },
            { id: 'ar.maher', name: 'Maher Al Muaiqly', language: 'Arabic' }
        ];
        
        res.json({ data: reciters });
    } catch (error) {
        console.error('Error fetching reciters:', error);
        res.status(500).json({ error: 'Failed to fetch reciters' });
    }
});

// Search verses
app.get('/api/search', async (req, res) => {
    try {
        const { query, language = 'en' } = req.query;
        
        if (!query) {
            return res.status(400).json({ error: 'Search query is required' });
        }
        
        const data = await getCachedData(`search-${query}-${language}`, async () => {
            const response = await axios.get(`https://api.alquran.cloud/v1/search/${encodeURIComponent(query)}/all/${language}`);
            return response.data;
        });
        
        res.json(data);
    } catch (error) {
        console.error('Error searching verses:', error);
        res.status(500).json({ error: 'Failed to search verses' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        cache_size: cache.size 
    });
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
    console.log(`🕌 Al-Hikmah Academy Quran Server running on port ${PORT}`);
    console.log(`📖 Access the application at: http://localhost:${PORT}`);
    console.log(`🔊 Audio proxy available at: http://localhost:${PORT}/api/audio/`);
    console.log(`💾 Cache enabled for API responses`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 Server shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 Server shutting down gracefully...');
    process.exit(0);
});
