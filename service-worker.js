const CACHE_NAME = "shopping-list-cache";
const urlsToCache = [
  "/",
  "/index.html",
  "/style.css", 
  "/script.js"
];

self.addEventListener("install", event => {
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        await cache.addAll(urlsToCache);
        console.log("Arquivos cacheados com sucesso");
      } catch (error) {
        console.error("Erro ao adicionar arquivos ao cache:", error);
      }
    })()
  );
});

self.addEventListener("activate", event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log(`Deletando cache antigo: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request)
          .catch(error => {
            console.error("Erro ao buscar recurso da rede:", error);
          });
      })
      .catch(error => {
        console.error("Erro ao recuperar o recurso do cache:", error);
      })
  );
});
