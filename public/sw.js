// Service Worker for Vite PWA
const CACHE_NAME = 'lift-a-kids-v1';

self.addEventListener('install', (event) => {
  console.log('Service Worker installed for Lift A Kids');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});