const CACHE='rabbocchi-muletti-prod-v1';
const CORE=[
  '/rabbocchi/',
  '/rabbocchi/index.html',
  '/rabbocchi/manifest.webmanifest',
  '/rabbocchi/icons/icon-192x192.png',
  '/rabbocchi/icons/icon-512x512.png',
  '/rabbocchi/icons/apple-touch-icon.png',
  '/rabbocchi/icons/favicon.png'
];
self.addEventListener('install',event=>{
  event.waitUntil(
    caches.open(CACHE)
      .then(cache=>Promise.all(CORE.map(url=>cache.add(url).catch(()=>null))))
      .then(()=>self.skipWaiting())
  );
});
self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k.startsWith('rabbocchi-muletti-')&&k!==CACHE).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET') return;
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin || !url.pathname.startsWith('/rabbocchi/')) return;
  if(event.request.mode==='navigate'){
    event.respondWith(
      fetch(event.request)
        .then(response=>{
          const copy=response.clone();
          caches.open(CACHE).then(cache=>cache.put('/rabbocchi/index.html',copy));
          return response;
        })
        .catch(()=>caches.match('/rabbocchi/index.html').then(r=>r||caches.match('/rabbocchi/')))
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then(cached=>{
      if(cached) return cached;
      return fetch(event.request).then(response=>{
        if(response && response.ok){
          const copy=response.clone();
          caches.open(CACHE).then(cache=>cache.put(event.request,copy));
        }
        return response;
      });
    })
  );
});