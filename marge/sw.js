/* Service worker : rend l'app utilisable hors connexion une fois installée. */

const CACHE = 'marge-v1';

const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/apple-touch-icon.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
];

// Les polices viennent de Google : on les garde une fois téléchargées, sinon
// l'app perdrait sa typographie dès que le téléphone est hors réseau.
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com'];

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
      // On ne supprime que nos propres anciens caches : le compteur de cigarettes a le sien,
      // sur la même origine, et l'effacer lui ferait perdre son mode hors ligne.
      .then((keys) => Promise.all(
        keys.filter((k) => k.startsWith('marge-') && k !== CACHE)
          .map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const isFont = FONT_HOSTS.includes(url.hostname);
  if (url.origin !== self.location.origin && !isFont) return;

  // Navigation : on tente le réseau pour récupérer une nouvelle version,
  // et on retombe sur le cache si le téléphone est hors ligne.
  if (request.mode === 'navigate') {
    // Seulement pour notre propre page : une sous-app installée plus tard sous
    // marge/ ne doit pas venir s'enregistrer sous notre clé index.html.
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

  // Le reste (icônes, manifeste, polices) change rarement : cache d'abord.
  event.respondWith(
    caches.match(request).then((hit) => hit || fetch(request).then((response) => {
      // Une réponse opaque (police cross-origin sans CORS) est stockable telle
      // quelle : elle resservira le fichier, on ne peut juste pas la lire ici.
      if (response.ok || response.type === 'opaque') {
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(request, copy));
      }
      return response;
    }))
  );
});
