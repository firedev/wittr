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

self.addEventListener('fetch', function (evt) {
  if (evt.request.url.includes('photos')) return evt
  evt.respondWith(
    caches.match(evt.request, { cacheName }).then(function (res) {
      if (res) {
        return res
      }
      fetch(evt.request).then(function (fetchres) {
        caches.open(cacheName).then(function (cache) {
          cache.add(evt.request, fetchres)
          return fetchres
        })
      })
    })
  )
})
