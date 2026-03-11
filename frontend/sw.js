/**
 * IronWall+ Service Worker — Cache-First Strategy
 * Caches all static assets for offline resilience and fast loads on mobile.
 */

const CACHE_NAME = 'ironwall-v2';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/attacker.html',
    '/webapp.html',
    '/network.html',
    '/style.css',
    '/game.js',
    '/attacker.js',
    '/chatbot.js',
    '/recorder.js',
    '/manifest.json',
    '/icon.png',
    'https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@700;900&display=swap',
];

// Install: pre-cache all static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            // Cache individually so one failure doesn't abort the rest
            return Promise.allSettled(
                STATIC_ASSETS.map(asset =>
                    cache.add(asset).catch(() => {/* ignore individual failures */ })
                )
            );
        }).then(() => self.skipWaiting())
    );
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
            )
        ).then(() => self.clients.claim())
    );
});

// Fetch: cache-first for static, network-first for WebSocket/API
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const reqUrl = new URL(request.url);

    // Never intercept WebSocket upgrades or API calls
    if (request.headers.get('upgrade') === 'websocket') return;
    if (reqUrl.pathname.startsWith('/ws')) return;
    if (reqUrl.port === '9001') return;

    // Network-first for HTML (to get updates), cache-first for assets
    const isHTML = request.destination === 'document' || reqUrl.pathname.endsWith('.html');

    if (isHTML) {
        // Network-first: try fresh, fall back to cache
        event.respondWith(
            fetch(request)
                .then(res => {
                    const clone = res.clone();
                    caches.open(CACHE_NAME).then(c => c.put(request, clone));
                    return res;
                })
                .catch(() => caches.match(request))
        );
    } else {
        // Cache-first: serve from cache, update in background
        event.respondWith(
            caches.match(request).then(cached => {
                const networkFetch = fetch(request).then(res => {
                    if (res.ok) {
                        const clone = res.clone();
                        caches.open(CACHE_NAME).then(c => c.put(request, clone));
                    }
                    return res;
                }).catch(() => cached);
                return cached || networkFetch;
            })
        );
    }
});
