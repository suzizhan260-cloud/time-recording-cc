// Service Worker for 工时记录小助手
const CACHE_NAME = 'workhour-tracker-v1.0.2';
const urlsToCache = [
  './index.html',
  './manifest.json',
  './icon_128x128.png',
  './icon_192x192.png',
  './icon_512x512.png'
];

// 安装 Service Worker
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('缓存已打开');
        return cache.addAll(urlsToCache);
      })
  );
});

// 激活 Service Worker
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('删除旧缓存:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 拦截请求
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // 缓存命中，返回缓存资源
        if (response) {
          return response;
        }

        // 克隆请求
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          function(response) {
            // 检查是否是有效响应
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // 克隆响应
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});
