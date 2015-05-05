var general_failure = function(promise, conn, args) {
    console.log("Promise Failure: " + promise + " with " + args);
};

var Connector = function() {
    this.change_event_manager = [];
    this.add_change_event_manager = [];
};

Connector.prototype.key_changed = function(key) {
    console.log("Key `" + key + "` has changed.");
    // alert that a key has changed in some way.
};

Connector.prototype.unblocking_key_change = function(key) {
    // A special kind of change that 'might' unblock a blocking call.
    // This will call key_changed when done.

    // This should only be called when a list is added to (because
    // blocking methods currently only work on lists). However,
    // there should be no penalty other than speed (it's ok if you
    // call it on an empty list, nothing should happen.

    this.key_changed(key);
};

Connector.prototype.run = function(args) {
    return new Promise(function(resolve, reject) {
        reject("Not implemented.");
    });
};

// Lets do some commands.
// Need more error checking here, if the json encode fails it'll do so silently.
Connector.prototype.cmd_jset = function(_this, args) {
    return new Promise(function(resolve, reject) {
        var key = args[0];
        var json_data = JSON.stringify(args[1]);
        _this.run(['set', key, json_data]).then(function() {
            resolve();
        }, function(more) {
            general_failure(more, _this, args);
        });
    });
};

Connector.prototype.cmd_jget = function(_this, args) {
    return new Promise(function(resolve, reject) {
        var key = args[0];
        _this.run(['get', key]).then(function(data) {
            resolve(JSON.parse(data));
        }, function(more) {
            general_failure(more, _this, args);
        });
    });
};

Connector.prototype.cmd_jmod = function(_this, args) {
    return new Promise(function(resolve, reject) {
        var key = args[0];
        var func = args[1];
        _this.run(['get', key]).then(function(data) {
            try {
                var new_value = func(JSON.parse(data));
            } catch (e) {
                reject(e, _this, args);
                return
            }
            _this.run(['set', key, JSON.stringify(new_value)]).then(function() {
                resolve(new_value);
            });
        }, function(more) {
            general_failure(more, _this, args);
        });
    });
};

Connector.prototype.cmd_lpush = function(_this, args) {
    return new Promise(function(resolve, reject) {
        _this.run(['get', args[0]]).then(function(data) {
            if (data == undefined) {
                _this.run(['set', args[0], '!' + JSON.stringify(args.slice(1))]).then(function() {
                    _this.unblocking_key_change(args[0]);
                    resolve();
                });
            } else if (data[0] != '!') {
                resolve("Wrong type: " + data);
            } else {
                var prev = JSON.parse(data.slice(1));
                var next = args.slice(1).concat(prev);
                _this.run(['set', args[0], '!' + JSON.stringify(next)]).then(function() {
                    _this.unblocking_key_change(args[0]);                    
                    resolve();
                });
            }
        });
    });
};

var Connector_LocalStorage = function() {
    this.ready = new Promise(function(resolve, reject) {
        resolve();
    });
};

Connector_LocalStorage.prototype = new Connector();

Connector_LocalStorage.prototype.run = function(args) {
    var command = args[0];
    var callback = this['cmd_' + command];

    if (callback != undefined) {
        return callback(this, args.slice(1));
    } else {
        throw "Command not found: " + command;
    }
};

Connector_LocalStorage.prototype.cmd_get = function(_this, args) {
    var key = args[0];
    return new Promise( function(resolve, reject) {
        var item = localStorage.getItem(key);
        if (item == null) {
            resolve(undefined);
        } else {
            resolve(item);
        }
    });
};

Connector_LocalStorage.prototype.cmd_set = function(_this, args) {
    var key = args[0];
    var value = args[1];
    return new Promise( function(resolve, reject) {
        var hit = localStorage.getItem(key) != undefined;
        localStorage.setItem(key, value);
        resolve(hit);
    });
};

Connector_LocalStorage.prototype.cmd_keys = function(_this, args) {
    return new Promise(function(resolve, reject) {
        var keys = [];
        for (var key in localStorage) {
            keys.push(key);
        }
        resolve(keys);
    });
};

Connector_LocalStorage.prototype.cmd_flushdb = function(_this, args) {
    return new Promise(function(resolve, reject) {
        localStorage.clear();
        resolve();
    });
};

Connector_LocalStorage.prototype.cmd_exists = function(_this, args) {
    return new Promise(function(resolve, reject) {
        var key = args[0];
        if (localStorage.getItem(key) == null) {
            resolve(false);
        } else {
            resolve(true);
        }
    });
};

Connector_LocalStorage.prototype.cmd_del = function(_this, args) {
    return new Promise(function(resolve, reject) {
        var key = args[0];
        localStorage.removeItem(key);
        resolve();
    });
};

/* ******************************************************** */

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
            var objectStore = _this.db.createObjectStore("keys", { keyPath: "key" });
            objectStore.createIndex("key", "key", { unique: true });
            objectStore.transaction.oncomplete = function(event) {
                resolve();
            };
        };
    });
};

Connector_IndexStorage.prototype = new Connector();

Connector_IndexStorage.prototype.run = function(args) {
    var tx = this.db.transaction(["keys"], "readwrite");
    var store = tx.objectStore("keys");
    var index = store.index("key");
    var command = args[0];
    var callback = this['cmd_' + command];
    
    if (callback != undefined) {
        return callback(this, args.slice(1), tx, store, index);
    } else {
        throw "Command not found: " + command;
    }
};

Connector_IndexStorage.prototype.cmd_get = function(_this, args, tx, store, index) {
    var key = args[0];
    return new Promise(function(resolve, reject) {
        var request = index.get(key);
        request.onsuccess = function() {
            var match = request.result;
            if (match) {
                resolve(match.value);
            } else {
                resolve(undefined);
            }
        }
        request.onerror = function() {
            reject(key);
        }
    });
};

Connector_IndexStorage.prototype.cmd_set = function(_this, args, tx, store, index) {
    var key = args[0];
    var value = args[1];
    return new Promise( function(resolve, reject) {
        var hit = localStorage.getItem(key) != undefined;
        
        var request = index.openCursor(IDBKeyRange.only(key));
        request.onsuccess = function() {
            var cursor = request.result;
            var new_value = {'key':key, 'value':value, 'type':''};
            
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
};

Connector_IndexStorage.prototype.cmd_keys = function(_this, args, tx, store, index) {
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
};

Connector_IndexStorage.prototype.cmd_exists = function(_this, args, tx, store, index) {
    var key = args[0];
    return new Promise(function(resolve, reject) {
        var request = index.get(key);
        request.onsuccess = function() {
            var match = request.result;
            if (match) {
                resolve(true);
            } else {
                resolve(false);
            }
        }
        request.onerror = function() {
            reject(key);
        }
    });
};

Connector_IndexStorage.prototype.cmd_flushdb = function(_this, args, tx, store, index) {
    var key = args[0];
    return new Promise(function(resolve, reject) {
        var request = store.clear();
        request.onsuccess = function() {
            resolve(true);
        }
        request.onerror = function() {
            reject(false);
        }
    });
};

Connector_IndexStorage.prototype.cmd_del = function(_this, args, tx, store, index) {
    var key = args[0];
    return new Promise(function(resolve, reject) {
        var request = index.get(key);
        request.onsuccess = function() {
            var match = request.result;
            if (match) {
                store.delete(key);
                resolve(true);
            } else {
                resolve(false);
            }
        }
        request.onerror = function() {
            reject(key);
        }
    });
};

