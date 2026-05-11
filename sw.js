// ============================================================
//  sw.js — Service Worker
//  ⚠️  Mude CACHE_VERSION sempre que atualizar o código!
// ============================================================

const CACHE_VERSION = 'v5';   // ← incremente aqui a cada deploy
const CACHE = 'carrinho-' + CACHE_VERSION;

const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
];

// Instala e cacheia os assets da versão atual
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())   // ativa imediatamente, sem esperar aba fechar
  );
});

// Remove caches de versões antigas
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())  // assume controle de todas as abas abertas
  );
});

// Network-first para navegação, cache-first para assets estáticos
self.addEventListener('fetch', e => {
  if (e.request.mode === 'navigate') {
    // Página principal: tenta rede, cai no cache se offline
    e.respondWith(
      fetch(e.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Assets (JS, CSS, imagens): cache-first, atualiza em background
  e.respondWith(
    caches.match(e.request).then(cached => {
      const network = fetch(e.request).then(res => {
        if (res && res.status === 200 && res.type !== 'opaque') {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      }).catch(() => null);
      return cached || network;
    })
  );
});