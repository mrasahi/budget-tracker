let db
// opens budget db connection v1
const request = indexedDB.open('budget', 1)

// for 
request.onupgradeneeded = event => {
  db = event.target.result
  db.createObjectStore('pending', { autoIncrement: true })
}

request.onsuccess = event => {
  db = event.target.result
    // Runs checkDatabase function once connection restored
  if (navigator.onLine) {
    checkDatabase()
  }
}

request.onerror = event => {
  console.log(event.target.errorCode)
}

const saveItem = item => {
  const transaction = db.transaction(['pending'], 'readwrite')
  const store = transaction.objectStore('pending')
  store.add(item)
}

const checkDatabase = () => {
  console.log('checking database')
  const transaction = db.transaction(['pending'], 'readwrite')
  const store = transaction.objectStore('pending')
  const getAll = store.getAll()

  getAll.onsuccess = () => {
    if (getAll.result.length > 0) {
      fetch('/api/items/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('user')}`
        },
        body: JSON.stringify(getAll.result)
      })
        .then(() => {
          const transaction = db.transaction(['pending'], 'readwrite')
          const store = transaction.objectStore('pending')
          store.clear()
        })
    }
  }
}

window.addEventListener('online', checkDatabase)