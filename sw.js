/* Service worker do Legado RH.
   Estratégia: NETWORK-FIRST para conteúdo do próprio site, para a app estar
   SEMPRE na versão mais recente quando há Internet; a cache serve apenas de
   recurso em caso de falha de rede (uso offline). Pedidos a outros domínios
   (Firebase, CDNs, Cloudinary) não são interceptados. */
const CACHE = 'legado-rh-v1';
const ASSETS = ['/', '/index.html', '/manifest.json', '/icon-192.png', '/icon-512.png', '/apple-touch-icon.png'];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS).catch(() => {})));
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  let url;
  try { url = new URL(req.url); } catch (e) { return; }
  if (url.origin !== self.location.origin) return; // não intercepta Firebase/CDN/Cloudinary

  event.respondWith((async () => {
    try {
      const fresh = await fetch(req);
      // guarda uma cópia para uso offline
      caches.open(CACHE).then(c => c.put(req, fresh.clone())).catch(() => {});
      return fresh;
    } catch (err) {
      const cached = await caches.match(req);
      if (cached) return cached;
      if (req.mode === 'navigate') {
        const idx = await caches.match('/index.html');
        if (idx) return idx;
      }
      throw err;
    }
  })());
});
