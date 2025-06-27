// This file is required for Vercel deployment
module.exports = (req, res) => {
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Al-Hikmah Academy - Quran API</title>
        </head>
        <body>
            <h1>🕌 Al-Hikmah Academy - Quran API</h1>
            <p>API is running successfully!</p>
            <h2>Available Endpoints:</h2>
            <ul>
                <li><a href="/api/health">/api/health</a> - Health check</li>
                <li><a href="/api/surahs">/api/surahs</a> - Get all Surahs</li>
                <li>/api/surah?number=1&language=arabic - Get specific Surah</li>
                <li>/api/audio?ayahNumber=1 - Get audio for specific Ayah</li>
            </ul>
            <p>بسم الله الرحمن الرحيم</p>
        </body>
        </html>
    `);
};
