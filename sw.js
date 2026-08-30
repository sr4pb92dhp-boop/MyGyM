// v3 — сеть в приоритете, кэш как запасной вариант
const CACHE = "gym-v3";

self.addEventListener("install", e => {
  self.skipWaiting();                       // не ждём закрытия старых вкладок
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(["index.html","manifest.json"])).catch(()=>{}));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  if(e.request.method !== "GET") return;
  e.respondWith(
    // сначала сеть: свежая версия приходит сразу
    fetch(e.request)
      .then(r => {
        const copy = r.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy)).catch(()=>{});
        return r;
      })
      // сети нет — отдаём из кэша, приложение работает офлайн
      .catch(() => caches.match(e.request).then(r => r || caches.match("index.html")))
  );
});
