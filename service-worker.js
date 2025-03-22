/**
 * MehmetEndustriyelTakip Service Worker
 * Çevrimdışı çalışma ve PWA desteği için
 */

const CACHE_NAME = 'mehmet-endustriyel-takip-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/css/main.css',
  '/css/login.css',
  '/css/dashboard.css',
  '/css/components.css',
  '/css/responsive.css',
  '/js/firebase-config.js',
  '/js/main.js',
  '/js/auth.js',
  '/js/dashboard.js',
  '/js/orders.js',
  '/js/purchasing.js',
  '/js/production.js',
  '/js/chatbot.js',
  '/js/ai-analytics.js',
  '/img/favicon.png',
  '/img/apple-touch-icon.png',
  '/manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-solid-900.woff2',
  'https://cdn.jsdelivr.net/npm/chart.js'
];

// Service Worker Kurulumu
self.addEventListener('install', event => {
  console.log('Service Worker kurulmaya başlıyor');
  
  // Sayfa önbelleğe alınıyor
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Önbellek oluşturuldu');
        return cache.addAll(ASSETS);
      })
      .then(() => {
        console.log('Assets önbelleğe alındı');
        return self.skipWaiting();
      })
  );
});

// Service Worker Aktifleştirme
self.addEventListener('activate', event => {
  console.log('Service Worker aktifleştiriliyor');
  
  // Eski önbellekleri temizleme
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => {
          return cacheName !== CACHE_NAME;
        }).map(cacheName => {
          console.log('Eski önbellek siliniyor:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
      // Service worker tüm istemciler üzerinde aktif hale getirilir
      return self.clients.claim();
    })
  );
});

// İstekleri Yakalama
self.addEventListener('fetch', event => {
  // Sadece GET isteklerini önbelleğe al
  if (event.request.method !== 'GET') return;
  
  // API isteklerini önbellekleme - Firebase ve diğer API'ler dışında
  if (event.request.url.includes('firebaseio.com') || 
      event.request.url.includes('googleapis.com') || 
      event.request.url.includes('firebase-settings')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Önbellekte varsa hemen dön
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Yoksa ağdan getir ve önbelleğe al
        return fetch(event.request)
          .then(response => {
            // Yanıt geçersizse, direkt dön
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Yanıtın klonunu al ve önbelleğe kaydet
            let responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(error => {
            // Ağ erişimi yoksa ve önbellekte de yoksa offline sayfasını dön
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html')
                .then(offlineResponse => {
                  return offlineResponse || new Response('İnternet bağlantısı yok', {
                    status: 503,
                    statusText: 'İnternet bağlantısı yok'
                  });
                });
            }
            
            console.error('Fetch hatası:', error);
            throw error;
          });
      })
  );
});

// Push Bildirimleri Alma
self.addEventListener('push', event => {
  console.log('Push alındı:', event);
  
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    
    const title = data.title || 'MehmetEndustriyelTakip';
    const options = {
      body: data.message || 'Yeni bir bildiriminiz var',
      icon: data.icon || '/img/favicon.png',
      badge: '/img/favicon.png',
      data: {
        url: data.url || '/'
      },
      actions: data.actions || []
    };
    
    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  } catch (error) {
    console.error('Push bildirimi işleme hatası:', error);
  }
});

// Bildirim Tıklama
self.addEventListener('notificationclick', event => {
  console.log('Bildirim tıklandı:', event);
  
  event.notification.close();
  
  // Tıklanınca belirli bir URL'ye yönlendirme
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    })
    .then(windowClients => {
      // Açık bir pencere varsa odaklan
      for (let client of windowClients) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Yoksa yeni pencere aç
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Çalışıyorum mesajı
console.log('Service Worker çalışıyor!');
