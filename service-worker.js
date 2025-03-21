self.addEventListener('install', (event) => {
  console.log('Service Worker Yükleniyor...');
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker Aktif!');
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
}); 