const version = 1
const urlsToCache = [
  '/',
  '/js/main.js',
  '/css/main.css',
  '/imgs/icon.png',
  'https://fonts.gstatic.com/s/roboto/v15/2UX7WLTfW3W8TclTUvlFyQ.woff',
  'https://fonts.gstatic.com/s/roboto/v15/d-6IYplOFocCacKzxwXSOD8E0i7KZn-EPnyo3HZu7kw.woff'
]

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(`wittr-static-v${version}`)
    .then(function(cache) {
      return(cache.addAll(urlsToCache))
    })
  )
})

self.addEventListener('fetch', function (evt) {
  if (evt.request.url.includes('photos')) return evt
  evt.respondWith(
    caches.match(evt.request, { cacheName }).then(function (res) {
      if (res) {
        return res
      }
      return response
    }).catch(function() {
      return new Response("FAILED")
    })
  )
})
