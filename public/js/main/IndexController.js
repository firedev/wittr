import PostsView from './views/Posts'
import ToastsView from './views/Toasts'
import idb from 'idb'

export default function IndexController(container) {
  this._container = container
  this._postsView = new PostsView(this._container)
  this._toastsView = new ToastsView(this._container)
  this._lostConnectionToast = null
  this._openSocket()
  this._registerServiceWorker()
}
IndexController.prototype._registerServiceWorker = function () {
  var indexController = this
  if (navigator.serviceWorker) {
    navigator.serviceWorker.register('/sw.js').then(function (reg) {
      // if there's no controller, this page wasn't loaded
      // via a service worker, so they're looking at the latest version.
      // In that case, exit early
      if (!navigator.serviceWorker.controller) return

      // if there's an updated worker already waiting, call
      if (reg.waiting) {
        return indexController._updateReady(reg.waiting)
      }

      if (reg.installing) {
        return indexController._trackInstalling(reg.installing)
      }

      reg.addEventListener('updatefound', function () {
        indexController._trackInstalling(reg.installing)
      })
    })

    navigator.serviceWorker.addEventListener('controllerchange', () =>
      window.location.reload()
    )
  }
}

IndexController.prototype._trackInstalling = function (sw) {
  var indexController = this
  sw.addEventListener('statechange', function () {
    if (sw.state === 'installed') {
      indexController._updateReady(sw)
    }
  })
}

// called when the web socket sends message data
IndexController.prototype._updateReady = function (worker) {
  var toast = this._toastsView.show('New version available', {
    buttons: ['refresh', 'dismiss'],
  })

  toast.answer.then(function (answer) {
    if (answer !== 'refresh') return
    worker.postMessage('refresh')
  })
}

// open a connection to the server for live updates
IndexController.prototype._openSocket = function () {
  var indexController = this
  var latestPostDate = this._postsView.getLatestPostDate()

  // create a url pointing to /updates with the ws protocol
  var socketUrl = new URL('/updates', window.location)
  socketUrl.protocol = 'ws'

  if (latestPostDate) {
    socketUrl.search = 'since=' + latestPostDate.valueOf()
  }

  // this is a little hack for the settings page's tests,
  // it isn't needed for Wittr
  socketUrl.search += '&' + location.search.slice(1)

  var ws = new WebSocket(socketUrl.href)

  // add listeners
  ws.addEventListener('open', function () {
    if (indexController._lostConnectionToast) {
      indexController._lostConnectionToast.hide()
    }
  })

  ws.addEventListener('message', function (event) {
    requestAnimationFrame(function () {
      indexController._onSocketMessage(event.data)
    })
  })

  ws.addEventListener('close', function () {
    // tell the user
    if (!indexController._lostConnectionToast) {
      indexController._lostConnectionToast = indexController._toastsView.show(
        'Unable to connect. Retrying…'
      )
    }

    // try and reconnect in 5 seconds
    setTimeout(function () {
      indexController._openSocket()
    }, 5000)
  })
}

// called when the web socket sends message data
IndexController.prototype._onSocketMessage = function (data) {
  var messages = JSON.parse(data)
  this._postsView.addPosts(messages)
}
