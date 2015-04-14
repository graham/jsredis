var Connector = function() {};
var Connector_LocalStorage = function() {};

Connector.prototype.run = function(args) {
    return new Promise(function(resolve, reject) {
        reject("Not implemented.");
    });
};

Connector_LocalStorage.prototype.run = function(args) {
    var command = args[0];
    var key = null;

    if (command == 'get') {
        key = args[1];
        return new Promise( function(resolve, reject) {
            resolve(localStorage.getItem(key));
        });
    } else if (command == 'set') {
        key = args[1];
        var value = args[2];
        return new Promise( function(resolve, reject) {
            var hit = localStorage.getItem(key) != undefined;
            localStorage.setItem(key, value);
            resolve(hit);
        });
    } else if (command == 'keys') {
        return new Promise(function(resolve, reject) {
            var keys = [];
            for (var key in localStorage) {
                keys.push(key);
            }
            resolve(keys);
        });
    } else {
        console.log("Unknown command: " + args);
    }
};

var Connector_IndexStorage = function() {
    var _this = this;
    this.db = null;
    this.ready = new Promise(function(resolve, reject) {
        var request = window.indexedDB.open("redis-db", 1);
        request.onsuccess = function(event) {
            _this.db = event.target.result;
            resolve();
        };
        request.onerror = function(event) {
            console.log("Failed to connect to IndexDB.");
            reject();
        };
        request.onupgradeneeded = function(event) {
            _this.db = event.target.result;

            // Create an objectStore for this database
            var objectStore = db.createObjectStore("keys", { keyPath: "key" });
            objectStore.createIndex("key", "key", { unique: true });
            objectStore.transaction.oncomplete = function(event) {
                resolve();
            };
        };
    });
};

Connector_IndexStorage.prototype.run = function(args) {
    var tx = this.db.transaction(["keys"], "readwrite");
    var store = tx.objectStore("keys");
    var index = store.index("key");

    var command = args[0];
    var key = null;
    
    if (command == 'get') {
        key = args[1];
        return new Promise(function(resolve, reject) {
            var request = index.get(key);
            request.onsuccess = function() {
                var matching = request.result;
                resolve(matching.value);
            }
            request.onerror = function() {
                reject(key);
            }
        });
    } else if (command == 'set') {
        key = args[1];
        var value = args[2];
        return new Promise( function(resolve, reject) {
            var hit = localStorage.getItem(key) != undefined;

            var request = index.openCursor(IDBKeyRange.only(key));
            request.onsuccess = function() {
                var cursor = request.result;
                var new_value = {'key':key, 'value':value, 'type':value.constructor.name};

                if (cursor) {
                    cursor.update(new_value);
                    resolve(new_value);
                } else {
                    store.put(new_value)
                    tx.oncomplete = function() {
                        resolve(new_value);
                    };
                }
            };
            request.onerror = function() {
                reject(key);
            };
        });
    } else if (command == 'keys') {
        return new Promise(function(resolve, reject) {
            var values = [];
            store.openCursor().onsuccess = function(event) {
                var cursor = event.target.result;
                if (cursor) {
                    values.push(cursor.value.key);
                    cursor.continue();
                } else {
                    resolve(values);
                }
            };
        });
    } else {
        console.log("Unknown command: " + args);
    }
};
