/* Service worker : rend l'app utilisable hors connexion une fois installée. */

const CACHE = 'clopes-v2';

const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/apple-touch-icon.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      // On ne supprime que nos propres anciens caches : le calculateur de marge (marge/) a le sien,
      // sur la même origine, et l'effacer lui ferait perdre son mode hors ligne.
      .then((keys) => Promise.all(
        keys.filter((k) => k.startsWith('clopes-') && k !== CACHE)
          .map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Navigation : on tente le réseau pour récupérer une nouvelle version,
  // et on retombe sur le cache si le téléphone est hors ligne.
  if (request.mode === 'navigate') {
    // Mais seulement pour notre propre page. Le dépôt héberge une seconde app
    // dans marge/, à l'intérieur de notre scope : sans ce garde-fou, sa page
    // s'enregistrerait sous notre clé index.html et remplacerait la copie hors
    // ligne du compteur.
    const rest = url.pathname.slice(new URL('./', self.location).pathname.length);
    if (rest !== '' && rest !== 'index.html') return;

    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put('./index.html', copy));
          return response;
        })
        .catch(() => caches.match('./index.html').then((hit) => hit || caches.match('./')))
    );
    return;
  }

  // Le reste (icônes, manifeste) change rarement : cache d'abord.
  event.respondWith(
    caches.match(request).then((hit) => hit || fetch(request).then((response) => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(request, copy));
      }
      return response;
    }))
  );
});
