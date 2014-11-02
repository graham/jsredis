var storage = (function() {
    var TIMEOUT_MS = 5;
    
    var StorageInstance = function(dbn) {
        if (dbn != undefined) {
            this.dbname = dbn;
        } else {
            this.dbname = 'jsredis_storage';
        }
        this.beacon = new Beacon();
    };

    StorageInstance.prototype.init_db = function() {
        var si = this;
        if (this.db) { this.db.close(); }
        this.db = null;

        return new Promise(function(resolve, reject) {
            var db_hook = indexedDB.open(si.dbname);
            
            // This will only be called if the database didn't previously exist
            // or if the version number has changed.
            db_hook.onupgradeneeded = function() {
                var db = db_hook.result;
                
                var store = db.createObjectStore("keys", {keyPath: "key"});
                var keyIndex = store.createIndex("by_key", "key", {unique:true});
                
                var meta_store = db.createObjectStore("meta_keys", {keyPath: "key"});
                var metKeyIndex = meta_store.createIndex("by_key", "key", {unique:true});
                
                si.db = db;
                setTimeout(resolve, TIMEOUT_MS);
            };
            
            // We've successfully connected to the database, because it already
            // existed and we can just start working.
            db_hook.onsuccess = function() {
                console.log('Connected to database.');
                si.db = db_hook.result;
                setTimeout(resolve, TIMEOUT_MS);
            };
            db_hook.onerror = function() {
                console.log(db_hook.error);
                reject();
            };
        });
    };

    StorageInstance.prototype.reset_all_data = function() {
        var si = this;
        if (this.db) { this.db.close(); }
        return new Promise(function(resolve, reject) {
            setTimeout( function() {
                var req = indexedDB.deleteDatabase( si.dbname );
                
                req.onsuccess = function () {
                    setTimeout(resolve, TIMEOUT_MS);
                };
                req.onerror = function () {
                    console.log('reset error');                
                    reject();
                };
                req.onblocked = function () {
                    console.log('reset blocked')                
                    reject();
                };
            }, TIMEOUT_MS);
        });            
    };
    
    StorageInstance.prototype.on = function(key, cb) {
        this.beacon.on(key, cb);
    };

    StorageInstance.prototype.transaction = function(table) {
        return this.db.transaction(table, "readwrite");
    };

    StorageInstance.prototype.table = function(name) {
        return new Table(this, name);
    };

    var Table = function(si, table_name) {
        this.si = si;
        this.table_name = table_name;
    };

    Table.prototype.search_subindex = function(key, cb) {
        var tx = this.si.transaction(this.table_name);
        var store = tx.objectStore("keys");
        var index = store.index("by_key");

        var request = index.openCursor(IDBKeyRange.bound(key+"/", key+":"));
        var results = [];
        request.onsuccess = function() {
            var cursor = request.result;

            if (cursor) {
                results.push(cursor.value);
                cursor.continue();
            } else {
                if (cb) {
                    cb(key, results);
                } else {
                    console.log(key, results);
                }                
            }
        }
    };

    Table.prototype.set = function(key, value) {
        var si = this.si;
        var table_name = this.table_name;
        return new Promise(function(resolve, reject) {
            var tx = si.transaction(table_name);
            var store = tx.objectStore("keys");
            var index = store.index("by_key");

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
    };
    
    Table.prototype.get = function(key) {
        var si = this.si;
        var table_name = this.table_name;
        return new Promise(function(resolve, reject) {
            var tx = si.transaction(table_name);
            var store = tx.objectStore("keys");
            var index = store.index("by_key");
            
            var request = index.get(key);
            request.onsuccess = function() {
                var matching = request.result;
                resolve(matching);
            }
            request.onerror = function() {
                reject(key);
            }
        });
    };

    Table.prototype.mget = function() {
        var the_table = this;
        var par_arguments = arguments;
        
        return new Promise(function(resolve, reject) {
            var keys = par_arguments;
            var promises = [];
            
            for(var i=0; i < par_arguments.length; i++) {
                var key = par_arguments[i];
                promises.push(the_table.get(key));
            }
            Promise.all(promises).then(function(accum) { resolve(accum); })
        });
    };

    return {
        "Storage":StorageInstance
    };
})();

if (typeof jsredis_module !== 'undefined') {
    jsredis_module.exports.storage = storage;
}
