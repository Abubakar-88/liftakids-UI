const CACHE_NAME = 'liftakids-cache-v1'; // Version change করলে auto update হবে
const API_CACHE_NAME = 'api-cache-v1';
const DYNAMIC_CACHE_NAME = 'dynamic-cache-v1';

// Install event
self.addEventListener('install', (event) => {
  console.log('🔄 Service Worker installing...');
  self.skipWaiting(); // new version  active 
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('📦 Caching app shell...');
      return cache.addAll([
        '/',
        '/index.html',
        '/static/js/main.js',
        '/static/css/main.css',
        '/manifest.json',
        '/favicon.ico'
      ]).catch(error => {
        console.error('❌ Cache addAll failed:', error);
      });
    })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('🔄 Service Worker activating...');
  event.waitUntil(
    Promise.all([
      // Clear old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Keep current caches, delete others
            if (cacheName !== CACHE_NAME && 
                cacheName !== API_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients immediately
      self.clients.claim()
    ]).then(() => {
      console.log('✅ Service Worker activated');
      // Notify all clients about update
      return self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'SW_UPDATED',
            payload: { version: CACHE_NAME }
          });
        });
      });
    })
  );
});

// Fetch event with network-first strategy for API, cache-first for assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // API requests - Network first
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache API responses if successful
          if (response.status === 200) {
            const responseToCache = response.clone();
            caches.open(API_CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseToCache);
              });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(request).then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Return offline page for API failures
            return new Response(
              JSON.stringify({ error: 'You are offline' }),
              { status: 503, headers: { 'Content-Type': 'application/json' } }
            );
          });
        })
    );
    return;
  }

  // Static assets - Cache first
  event.respondWith(
    caches.match(request)
      .then((response) => {
        if (response) {
          return response; // Return cached version
        }
        
        // Not in cache, fetch from network
        return fetch(request).then(networkResponse => {
          // Cache dynamic content (images, etc.)
          if (networkResponse.status === 200 && 
              request.method === 'GET' &&
              !url.pathname.startsWith('/api/')) {
            const responseToCache = networkResponse.clone();
            caches.open(DYNAMIC_CACHE_NAME)
              .then(cache => {
                cache.put(request, responseToCache);
              });
          }
          return networkResponse;
        }).catch(error => {
          console.error('Fetch failed:', error);
          // Return offline fallback for HTML requests
          if (request.headers.get('Accept').includes('text/html')) {
            return caches.match('/offline.html');
          }
          return new Response('Network error', { status: 408 });
        });
      })
  );
});

// Listen for messages from the client
self.addEventListener('message', (event) => {
  console.log('📨 Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('⏭️ Skip waiting and activate new version');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CHECK_VERSION') {
    // Send current version back to client
    event.source.postMessage({
      type: 'VERSION_INFO',
      payload: { version: CACHE_NAME }
    });
  }
});

// Handle push notifications (if needed)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data.text(),
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };
  
  event.waitUntil(
    self.registration.showNotification('Lift A Kids', options)
  );
});