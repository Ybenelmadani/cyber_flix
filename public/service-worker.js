// service-worker.js — CYBERFLIX PWA Offline & Cache Manager
const CACHE_NAME = 'cyberflix-cache-v1';
const STATIC_ASSETS = [
  '/',
  '/favicon.svg',
  '/cyberflix-logo.svg',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key.startsWith('cyberflix-cache-') && key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET, API calls, and browser extensions
  if (
    request.method !== 'GET' ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/tmdb') ||
    url.protocol.startsWith('chrome')
  ) {
    return;
  }

  // Network-first for HTML pages (so user always gets latest SEO / content)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/'))
    );
    return;
  }

  // Cache-first for static media, fonts, and assets
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          if (
            response &&
            response.status === 200 &&
            (url.pathname.startsWith('/static/') || url.pathname.endsWith('.svg') || url.pathname.endsWith('.png'))
          ) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => cached);
    })
  );
});
