const CACHE_NAME = 'liftakids-v1'; // Version number  auto update 

self.addEventListener('install', (event) => {
  self.skipWaiting(); // version instantly active 
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/static/js/main.js',
        // অন্যান্য assets
      ]);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName); //cache delete
          }
        })
      );
    })
  );
  return self.clients.claim(); // client version apply
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});