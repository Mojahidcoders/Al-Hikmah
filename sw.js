// Service Worker for offline functionality
const CACHE_NAME = 'al-hikmah-quran-v1';
const STATIC_CACHE = 'static-v1';
const AUDIO_CACHE = 'audio-v1';

// Files to cache for offline functionality
const STATIC_FILES = [
    '/',
    '/index.html',
    '/css/styles.css',
    '/js/app.js',
    '/manifest.json',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Poppins:wght@300;400;500;600;700&display=swap'
];

// Install event - cache static assets
self.addEventListener('install', event => {
    console.log('Service Worker installing...');
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('Caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('Static files cached successfully');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('Error caching static files:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker activating...');
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE && cacheName !== AUDIO_CACHE) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Old caches cleaned up');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve cached content when offline
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Handle API requests
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            handleApiRequest(request)
        );
        return;
    }

    // Handle audio requests
    if (request.url.includes('.mp3') || request.url.includes('audio')) {
        event.respondWith(
            handleAudioRequest(request)
        );
        return;
    }

    // Handle static files
    event.respondWith(
        caches.match(request)
            .then(response => {
                if (response) {
                    return response;
                }
                
                return fetch(request)
                    .then(response => {
                        // Check if response is valid
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone response for caching
                        const responseToCache = response.clone();
                        
                        caches.open(STATIC_CACHE)
                            .then(cache => {
                                cache.put(request, responseToCache);
                            });

                        return response;
                    });
            })
            .catch(() => {
                // Return offline page or fallback
                if (request.destination === 'document') {
                    return caches.match('/index.html');
                }
            })
    );
});

// Handle API requests with caching
async function handleApiRequest(request) {
    try {
        // Try to fetch from network first
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            // Cache successful API responses
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
            return networkResponse;
        }
    } catch (error) {
        console.log('Network request failed, trying cache...');
    }
    
    // If network fails, try to serve from cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }
    
    // Return error response if nothing works
    return new Response(
        JSON.stringify({ error: 'Network unavailable and no cached data found' }),
        {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'application/json' }
        }
    );
}

// Handle audio requests with caching
async function handleAudioRequest(request) {
    try {
        // Check cache first for audio files
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Fetch from network
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            // Cache audio files for offline playback
            const cache = await caches.open(AUDIO_CACHE);
            cache.put(request, networkResponse.clone());
            return networkResponse;
        }
        
        return networkResponse;
    } catch (error) {
        console.log('Audio request failed:', error);
        
        // Return a placeholder or error response
        return new Response(
            'Audio not available offline',
            { status: 503, statusText: 'Service Unavailable' }
        );
    }
}

// Listen for messages from the main thread
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'CLEAR_CACHE') {
        clearAllCaches().then(() => {
            event.ports[0].postMessage({ success: true });
        });
    }
});

// Clear all caches
async function clearAllCaches() {
    const cacheNames = await caches.keys();
    return Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
    );
}

// Background sync for offline actions
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        event.waitUntil(
            handleBackgroundSync()
        );
    }
});

async function handleBackgroundSync() {
    // Handle any offline actions that need to be synced
    console.log('Background sync triggered');
}
