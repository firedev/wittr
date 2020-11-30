const version = 2
let cacheName = `wittr-static-v${version}`
const urlsToCache = [
  '/',
  '/js/main.js',
  '/css/main.css',
  '/imgs/icon.png',
  'https://fonts.gstatic.com/s/roboto/v15/2UX7WLTfW3W8TclTUvlFyQ.woff',
  'https://fonts.gstatic.com/s/roboto/v15/d-6IYplOFocCacKzxwXSOD8E0i7KZn-EPnyo3HZu7kw.woff',
]

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(cacheName).then(function (cache) {
      return cache.addAll(urlsToCache)
    })
  )
})

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key.startsWith(`wittr-static`) && key !== cacheName) {
            return caches.delete(key)
          }
        })
      )
    )
  )
})

self.addEventListener('fetch', function(event) {
  if (event.request.url.includes('photos')) return event
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
})
