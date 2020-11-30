import idb from 'idb'

const dbPromise = idb.open('test-db', 1, function (upgradeDB) {
  console.log(upgradeDB.oldVersion)
  switch (upgradeDB.oldVersion) {
    case 0: {
      console.log('case 0')
      const keyValStore = upgradeDB.createObjectStore('keyval')
      keyValStore.put('hello', 'world')
    }
    case 1: {
      console.log('case 1')
      upgradeDB.createObjectStore('people', { keyPath: 'name' })
    }
    case 2: {
      console.log('case 2')
      const peopleStore = upgradeDB.transaction.objectStore('people')
      peopleStore.createIndex('animal', 'favoriteAnimal')
      peopleStore.createIndex('age', 'age')
    }
  }
})

dbPromise
  .then((db) => {
    const tx = db.transaction('keyval')
    const keyValStore = tx.objectStore('keyval')
    return keyValStore.get('hello')
  })
  .then(console.log)

dbPromise
  .then((db) => {
    const tx = db.transaction('keyval', 'readwrite')
    const keyValStore = tx.objectStore('keyval')
    keyValStore.put('bar', 'foo')
    return tx.complete
  })
  .then(console.log)

dbPromise
  .then((db) => {
    const tx = db.transaction('keyval', 'readwrite')
    tx.objectStore('keyval').put('cat', 'favoriteAnimal')
    return tx.complete
  })
  .then(console.log)

dbPromise
  .then((db) => {
    const tx = db.transaction('people', 'readwrite')
    tx.objectStore('people').put({
      name: 'Nikolay X',
      age: 66,
      favoriteAnimal: 'dog',
    })
    tx.objectStore('people').put({
      name: 'Ann X',
      age: 33,
      favoriteAnimal: 'cat',
    })
    tx.objectStore('people').put({
      name: 'Eva X',
      age: 22,
      favoriteAnimal: 'cat',
    })
    return tx.complete
  })
  .then(console.log)

dbPromise
  .then((db) => {
    const tx = db.transaction('people', 'readwrite')
    return tx.objectStore('people').index('age').getAll()
  })
  .then(console.log)

dbPromise
  .then((db) => {
    const tx = db.transaction('people', 'readwrite')
    return tx.objectStore('people').index('age').openCursor()
  })
  .then(function logPerson(cursor) {
    if(!cursor) return
    console.log('Cursor at:', cursor.value.name)
    return cursor.continue().then(logPerson)
  }).then(() => console.log('Done'))
