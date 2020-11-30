import idb from 'idb'
window.idb = idb

const dbPromise = idb.open('test-db', 1, function (upgradeDB) {
  const keyValStore = upgradeDB.createObjectStore('keyval')
  keyValStore.put('hello', 'world')
})

window.dbPromise = dbPromise

dbPromise.then(db => {
  const tx = db.transaction('keyval')
  const keyValStore = tx.objectStore('keyval')
  return keyValStore.get('hello')
}).then(console.log)

dbPromise.then(db => {
  const tx = db.transaction('keyval', 'readwrite')
  const keyValStore = tx.objectStore('keyval')
  keyValStore.put('bar', 'foo')
  return tx.complete
}).then(console.log)

dbPromise.then(db =>
  db.transaction('keyval', 'readwrite').objectStore('keyval').put('cat', 'favoriteAnimal')
)
