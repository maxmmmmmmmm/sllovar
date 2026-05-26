/* Service worker для словаря — офлайн-кэш.
   Залей этот файл рядом с index.html на GitHub Pages.
   Стратегия: сначала кэш, в фоне обновление из сети (stale-while-revalidate). */

var CACHE = 'vocab-cache-v1';

self.addEventListener('install', function(e){
  self.skipWaiting();
});

self.addEventListener('activate', function(e){
  // Удаляем старые версии кэша
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.map(function(k){
        if(k !== CACHE) return caches.delete(k);
      }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e){
  if(e.request.method !== 'GET') return;
  e.respondWith(
    caches.open(CACHE).then(function(cache){
      return cache.match(e.request).then(function(cached){
        var network = fetch(e.request).then(function(resp){
          if(resp && resp.status === 200){
            cache.put(e.request, resp.clone());
          }
          return resp;
        }).catch(function(){
          return cached;
        });
        // Есть в кэше — отдаём сразу, сеть обновит в фоне
        return cached || network;
      });
    })
  );
});
