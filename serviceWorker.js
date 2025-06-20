const CACHE_NAME = 'chiptune-composer-cache-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/config.json', // Configuration file
  '/styles/system.css', // Ensure system.css is present
  '/styles/core.css',
  '/styles/fonts.css',
  '/styles/grid.css',
  '/styles/panels.css',
  '/src/main.js',
  '/src/constants.js',
  '/src/audio/engine.js',
  '/src/audio/effects.js',
  '/src/audio/generators.js',
  '/src/audio/instruments.js',
  '/src/ui/grid.js',
  '/src/ui/panels.js',
  '/src/ui/transport.js',
  '/src/ui/visualizer.js',
  '/src/utils/file-io.js',
  '/src/utils/formatters.js',
  '/src/utils/midi-export.js',
  '/src/utils/midi-import.js',
  // Fonts
  '/assets/fonts/PressStart2P.woff2', // Existing
  '/assets/fonts/system/ChicagoFLF.woff',
  '/assets/fonts/system/ChicagoFLF.woff2',
  '/assets/fonts/system/monaco.woff',
  '/assets/fonts/system/monaco.woff2',
  '/assets/fonts/system/ChiKareGo2.woff',
  '/assets/fonts/system/ChiKareGo2.woff2',
  '/assets/fonts/system/FindersKeepers.woff',
  '/assets/fonts/system/FindersKeepers.woff2',
  // Images
  '/assets/images/system/button.svg',
  '/assets/images/system/button-default.svg',
  '/assets/images/system/apple.svg',
  // Example sprites (keeping existing)
  '/assets/sprites/buttons.png',
  '/assets/sprites/icons.png',
  // UI sounds (keeping existing)
  '/assets/audio/ui/click.wav',
  '/assets/audio/ui/confirm.wav',
  '/serviceWorker.js' // Add service worker itself
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[ServiceWorker] Caching app shell', ASSETS);
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(res => {
      if (res) {
        return res; // Serve from cache
      }
      // Not found in cache, fetch from network
      return fetch(event.request).then(response => {
        // Optionally, cache new requests dynamically
        // Be careful with caching everything, especially with POST requests or opaque responses
        // For this app, focusing on pre-caching defined assets is safer.
        return response;
      });
    })
  );
});