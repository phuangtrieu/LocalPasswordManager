/* ============================================
   Service Worker — SecureVault PWA
   ============================================ */

const CACHE_NAME = 'securevault-v1';
const ASSETS_TO_CACHE = [
    '/index.html',
    '/css/style.css',
    '/js/app.js',
    '/js/auth.js',
    '/js/crypto.js',
    '/js/gsheets.js',
    '/js/password-gen.js',
    '/js/utils.js',
    '/manifest.json',
];

// Install — cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            );
        })
    );
    self.clients.claim();
});

// Fetch — network first, cache fallback
self.addEventListener('fetch', (event) => {
    // Skip non-GET and external API requests
    if (event.request.method !== 'GET') return;
    if (event.request.url.includes('googleapis.com')) return;
    if (event.request.url.includes('accounts.google.com')) return;
    if (event.request.url.includes('fonts.googleapis.com')) return;
    if (event.request.url.includes('fonts.gstatic.com')) return;

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Cache successful responses
                if (response.ok) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, clone);
                    });
                }
                return response;
            })
            .catch(() => {
                // Fallback to cache
                return caches.match(event.request);
            })
    );
});
