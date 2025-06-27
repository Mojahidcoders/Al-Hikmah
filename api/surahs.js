const axios = require('axios');

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
};
