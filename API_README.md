# Al-Hikmah Academy - Quran API

## 🌐 Vercel Deployment

This API is deployed on Vercel as serverless functions to provide Quran data with proper CORS handling.

### 🔗 API Endpoints

#### Base URL: `https://al-hikmah-9v7m.vercel.app`

#### Available Endpoints:

1. **Health Check**
   ```
   GET /api/health
   ```
   Returns API status and version information.

2. **Get All Surahs**
   ```
   GET /api/surahs
   ```
   Returns metadata for all 114 Surahs.

3. **Get Specific Surah**
   ```
   GET /api/surah?number={surah_number}&language={language}
   ```
   - **Parameters:**
     - `number`: Surah number (1-114)
     - `language`: `arabic`, `english`, or `urdu`
   
   **Examples:**
   - `/api/surah?number=1&language=arabic` - Al-Fatiha in Arabic
   - `/api/surah?number=2&language=english` - Al-Baqarah in English
   - `/api/surah?number=3&language=urdu` - Ali-Imran in Urdu

4. **Get Audio**
   ```
   GET /api/audio?ayahNumber={ayah_number}
   ```
   - **Parameters:**
     - `ayahNumber`: Global Ayah number
   
   **Example:**
   - `/api/audio?ayahNumber=1` - Audio for first Ayah

### 🛠️ Features

- ✅ **CORS Enabled**: All endpoints support cross-origin requests
- ✅ **Caching**: Responses are cached for 24 hours for better performance
- ✅ **Error Handling**: Proper error responses with meaningful messages
- ✅ **Serverless**: Deployed as Vercel serverless functions
- ✅ **High Availability**: Vercel's global edge network

### 📱 Frontend Integration

The frontend automatically detects the environment:
- **Local Development**: Uses local backend server
- **Production**: Uses Vercel serverless API

### 🔧 Deployment Structure

```
/api/
├── audio.js      # Audio proxy endpoint
├── health.js     # Health check endpoint
├── surah.js      # Surah data endpoint
└── surahs.js     # Surahs list endpoint
```

### 🌟 Usage Examples

#### JavaScript Fetch
```javascript
// Get all Surahs
const surahs = await fetch('https://al-hikmah-9v7m.vercel.app/api/surahs')
  .then(response => response.json());

// Get specific Surah
const surah = await fetch('https://al-hikmah-9v7m.vercel.app/api/surah?number=1&language=english')
  .then(response => response.json());
```

#### cURL
```bash
# Health check
curl https://al-hikmah-9v7m.vercel.app/api/health

# Get Surah Al-Fatiha in Arabic
curl "https://al-hikmah-9v7m.vercel.app/api/surah?number=1&language=arabic"
```

---

**الحمد لله** - All praise to Allah for making this API successful! 🕌
