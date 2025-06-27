const axios = require('axios');

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    
    const { ayahNumber } = req.query;
    
    if (!ayahNumber) {
        res.status(400).json({ error: 'Ayah number is required' });
        return;
    }
    
    try {
        const audioUrl = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayahNumber}.mp3`;
        
        const response = await axios.get(audioUrl, {
            responseType: 'stream'
        });
        
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
        
        response.data.pipe(res);
    } catch (error) {
        console.error('Error proxying audio:', error);
        res.status(500).json({ error: 'Failed to fetch audio' });
    }
};
