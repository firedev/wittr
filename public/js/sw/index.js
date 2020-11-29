const version = 2
self.addEventListener('fetch', function(event) {
  event.respondWith(
    fetch(event.request).then(function(response) {
      if(response.status === 404) {
        return new Response("Not found")
      }
      return response
    }).catch(function() {
      return new Response("FAILED")
    })
  )
})
