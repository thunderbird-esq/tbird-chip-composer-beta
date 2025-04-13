const CACHE_NAME = 'chiptune-composer-cache-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/styles/core.css',
  '/src/main.js',
  '/src/audio/engine.js',
  '/src/audio/effects.js',
  '/src/audio/generators.js',
  '/src/ui/grid.js',
  '/src/ui/panels.js',
  '/assets/fonts/PressStart2P.woff2',
  '/assets/audio/ui/click.wav',
  '/assets/audio/ui/confirm.wav'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(res => 
      res || fetch(event.request)
    )
  );
});