const CACHE_NAME = 'focus-app-v1';
const urlsToCache = [
  '/Focus/',
  '/Focus/index.html',
  '/Focus/style.css',
  '/Focus/script.js',
  '/Focus/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});