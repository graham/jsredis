// Emulate localstorage (sorta) with indexdb.
let log = (data) => { console.log(data) }

class Database {
    constructor(dbname) {
        this.ready = new Promise((resolve, reject) => {
            var request = window.indexedDB.open(dbname, 1)

            request.onsuccess = (event) => {
                this.db = event.target.result
                resolve()
            }

            request.onerror = (event) => {
                console.log("Failed to connect to IndexDB.")
                reject()
            }

            request.onupgradeneeded = (event) => {
                this.db = event.target.result
                // Create an objectStore for this database
                var objectStore = this.db.createObjectStore("keys", {keyPath: "key"})
                objectStore.createIndex("key", "key", {unique: true})
                objectStore.transaction.oncomplete = (event) => {
                    resolve()
                }
            }
        })
    }

    getItem(key) {
        var tx = this.db.transaction(["keys"], "readonly")
        var store = tx.objectStore("keys")
        var index = store.index("key")
        return new Promise((resolve, reject) => {
            var request = index.get(key)
            request.onsuccess = () => {
                var match = request.result
                if (match) {
                    resolve(match.value)
                } else {
                    resolve(undefined)
                }
            }
            request.onerror = () => {
                reject(key)
            }
        })
    }

    setItem(key, value) {
        var tx = this.db.transaction(["keys"], "readwrite")
        var store = tx.objectStore("keys")
        var index = store.index("key")
        return new Promise((resolve, reject) => {
            var request = index.openCursor(IDBKeyRange.only(key))
            request.onsuccess = () => {
                var cursor = request.result
                var new_value = {'key':key, 'value':value}
                if (cursor) {
                    cursor.update(new_value)
                    resolve(new_value)
                } else {
                    store.put(new_value)
                    tx.oncomplete = () => {
                        resolve(new_value)
                    }
                }
            }
            request.onerror = () => {
                reject(key)
            }
        })
    }

    removeItem(key) {
        var tx = this.db.transaction(["keys"], "readwrite")
        var store = tx.objectStore("keys")
        var index = store.index("key")
        return new Promise((resolve, reject) => {
            var request = index.get(key)
            request.onsuccess = () => {
                var match = request.result
                if (match) {
                    store.delete(key)
                    resolve(true)
                } else {
                    resolve(false)
                }
            }
            request.onerror = () => {
                reject(key)
            }
        })
    }

    keys() {
        var tx = this.db.transaction(["keys"], "readonly")
        var store = tx.objectStore("keys")
        var index = store.index("key")
        return new Promise((resolve, reject) => {
            var values = []
            store.openCursor().onsuccess = (event) => {
                var cursor = event.target.result
                if (cursor) {
                    values.push(cursor.value.key)
                    cursor.continue()
                } else {
                    resolve(values)
                }
            }
        })
    }

    clear() {
        var tx = this.db.transaction(["keys"], "readwrite")
        var store = tx.objectStore("keys")
        var index = store.index("key")
        return new Promise((resolve, reject) => {
            var request = store.clear()
            request.onsuccess = () => {
                resolve(true)
            }
            request.onerror = () => {
                reject(false)
            }
        })
    }

    filter(filter_function, limit) {
        if (!filter_function) {
            filter_function = (value) => { return true }
        }

        var tx = this.db.transaction(["keys"], "readonly")
        var store = tx.objectStore("keys")
        var index = store.index("key")

        return new Promise((resolve, reject) => {
            let values = []
            store.openCursor().onsuccess = (event) => {
                var cursor = event.target.result

                if (cursor) {
                    let include = filter_function(cursor.value)
                    if (include) {
                        values.push(cursor.value)
                    }
                    if (values.length >= limit) {
                        resolve(values)
                        return
                    }
                    cursor.continue()
                } else {
                    resolve(values)
                }
            }
        })
    }
}

