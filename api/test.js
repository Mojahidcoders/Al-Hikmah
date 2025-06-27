// Test endpoint to verify API is working
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
        res.json({ 
            status: 'success',
            message: 'API is working correctly',
            timestamp: new Date().toISOString(),
            environment: process.env.VERCEL ? 'vercel' : 'local',
            endpoints: {
                surahs: '/api/surahs',
                surah: '/api/surah?number=1&language=arabic',
                audio: '/api/audio?ayahNumber=1',
                health: '/api/health'
            }
        });
    } catch (error) {
        console.error('Test endpoint error:', error);
        res.status(500).json({ error: 'Test endpoint failed' });
    }
};
