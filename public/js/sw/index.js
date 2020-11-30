const version = 2
let cacheName = `wittr-static-v${version}`
const urlsToCache = [
  '/skeleton',
  '/css/main.css',
  '/imgs/icon.png',
  'https://fonts.gstatic.com/s/roboto/v15/2UX7WLTfW3W8TclTUvlFyQ.woff',
  'https://fonts.gstatic.com/s/roboto/v15/d-6IYplOFocCacKzxwXSOD8E0i7KZn-EPnyo3HZu7kw.woff',
]

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(cacheName).then(function (cache) {
      cache.addAll(urlsToCache)
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

self.addEventListener('fetch', function (event) {
  if (event.request.url.includes('photos')) return event
  const requestUrl = new URL(event.request.url)
  if(requestUrl.origin === location.origin && requestUrl.pathname === '/') {
    return event.respondWith(caches.match('/skeleton'))
  }
  event.respondWith(
    caches
      .match(event.request.url === "/" ? "/skeleton" : event.request.url)
      .then(function (response) {
        return response || fetch(event.request)
      })
  )
})

self.addEventListener('message', function (event) {
  if (event.data === 'refresh') self.skipWaiting()
})
