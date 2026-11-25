const CACHE = 'siir-v15';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'apple-touch-icon.png', 'bunny/bed.png', 'bunny/food_apple.png', 'bunny/food_broccoli.png', 'bunny/food_cucumber.png', 'bunny/food_hay.png', 'bunny/food_lettuce.png', 'bunny/food_strawberry.png', 'bunny/back.png', 'bunny/carrot.png', 'bunny/carrot_item.png', 'bunny/f_angry.png', 'bunny/f_cry.png', 'bunny/f_happy.png', 'bunny/f_love.png', 'bunny/f_neutral.png', 'bunny/f_surprised.png', 'bunny/front.png', 'bunny/jump.png', 'bunny/peek.png', 'bunny/sing.png', 'bunny/sit.png', 'bunny/sleep.png', 'bunny/walk0.png', 'bunny/walk1.png', 'bunny/walk2.png', 'bunny/walk3.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).catch(() => {}).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

// Ağ öncelikli, ağ yoksa önbellekten aç: güncellemeler hemen gelir, çevrimdışı da açılır.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(fetch(req).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  }).catch(() => caches.match(req).then(r => r || caches.match('index.html'))));
});

self.addEventListener('push', event => {
  let d = {};
  try { d = event.data ? event.data.json() : {}; } catch (e) {}
  event.waitUntil((async () => {
    await self.registration.showNotification(d.title || 'Sana bir şiir var', {
      body: d.body || '', icon: 'icon-192.png', badge: 'icon-192.png', data: { url: d.url || './' }
    });
    try { if (self.navigator.setAppBadge) await self.navigator.setAppBadge(1); } catch (e) {}
  })());
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || './';
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    for (const c of list) { if ('focus' in c) return c.focus(); }
    return self.clients.openWindow(url);
  }));
});
