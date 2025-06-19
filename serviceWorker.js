const CACHE_NAME = 'chiptune-composer-cache-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/config.json', // Configuration file
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
  // Add specific assets if they are critical and not too numerous
  '/assets/fonts/PressStart2P.woff2',
  '/assets/sprites/buttons.png', // Example sprite
  '/assets/sprites/icons.png',   // Example sprite
  // UI sounds are good to cache
  '/assets/audio/ui/click.wav',
  '/assets/audio/ui/confirm.wav',
  // Consider adding /serviceWorker.js itself if updates are handled well by the activate step
  // '/serviceWorker.js' // Let's add it, as the activate step handles old cache deletion.
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