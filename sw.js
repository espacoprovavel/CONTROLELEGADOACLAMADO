/* Service worker do Legado RH.
   - Páginas e ficheiros do próprio site: NETWORK-FIRST (sempre a versão mais
     recente com Internet; a cópia guardada só entra quando não há ligação).
   - Bibliotecas externas (Firebase, jsPDF, ZIP, fontes…): guardadas para a app
     abrir sem Internet; atualizadas em segundo plano.
   - Documentos dos funcionários (Cloudinary): guardados na primeira vez que são
     abertos/descarregados ou com "📶 Guardar offline"; o mesmo endereço é sempre
     o mesmo ficheiro, por isso serve-se a cópia guardada.
   - Pedidos à base de dados (Firestore/autenticação) e uploads NÃO passam por
     aqui: o próprio Firebase trata do modo offline. */
const CACHE = 'legado-rh-v2';
const DOCS_CACHE = 'legado-docs-v1';
const ASSETS = ['/', '/index.html', '/manifest.json', '/icon-192.png', '/icon-512.png', '/apple-touch-icon.png'];
const LIBS = [
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js',
  'https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth-compat.js',
  'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore-compat.js',
];
const LIB_HOSTS = ['cdnjs.cloudflare.com', 'cdn.sheetjs.com', 'www.gstatic.com', 'fonts.googleapis.com', 'fonts.gstatic.com', 'upload-widget.cloudinary.com', 'widget.cloudinary.com'];
const DOC_HOSTS = ['res.cloudinary.com'];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil((async () => {
    const c = await caches.open(CACHE);
    await c.addAll(ASSETS).catch(() => {});
    await Promise.all(LIBS.map(u => fetch(new Request(u, { mode: 'no-cors' })).then(r => c.put(u, r)).catch(() => {})));
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    // apaga só versões antigas da app; os documentos guardados mantêm-se
    await Promise.all(keys.filter(k => k !== CACHE && k !== DOCS_CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

async function networkFirst(req) {
  try {
    const fresh = await fetch(req);
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
}

async function staleWhileRevalidate(req) {
  const c = await caches.open(CACHE);
  const cached = await c.match(req);
  const update = fetch(req).then(r => { if (r && (r.ok || r.type === 'opaque')) c.put(req, r.clone()); return r; }).catch(() => null);
  return cached || (await update) || Response.error();
}

async function documento(req) {
  const c = await caches.open(DOCS_CACHE);
  const cached = await c.match(req.url);
  if (cached) return cached;
  let resp;
  try { resp = await fetch(new Request(req.url, { mode: 'cors', credentials: 'omit' })); } // cópia legível também por fetch()
  catch (e) { resp = await fetch(req); }
  if (resp && (resp.ok || resp.type === 'opaque')) c.put(req.url, resp.clone()).catch(() => {});
  return resp;
}

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  let url;
  try { url = new URL(req.url); } catch (e) { return; }
  if (url.origin === self.location.origin) { event.respondWith(networkFirst(req)); return; }
  if (DOC_HOSTS.includes(url.hostname)) { event.respondWith(documento(req)); return; }
  if (LIB_HOSTS.includes(url.hostname)) { event.respondWith(staleWhileRevalidate(req)); return; }
  // restantes (Firestore, autenticação, uploads): não interceta
});
