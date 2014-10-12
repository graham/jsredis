var storage = (function() {
    var StorageInstance = function() {
        var si = this;

        this.db = null;

        db_hook = indexedDB.open("jsredis_storage");

        // This will only be called if the database didn't previously exist
        // or if the version number has changed.
        db_hook.onupgradeneeded = function() {
            var db = db_hook.result;
            si.on_load(db);

            var store = db.createObjectStore("keys", {keyPath: "key"});
            var keyIndex = store.createIndex("by_key", "key", {unique:true});
            
            var meta_store = db.createObjectStore("meta_keys", {keyPath: "key"});
            var metKeyIndex = meta_store.createIndex("by_key", "key", {unique:true});
        };

        // We've successfully connected to the database, because it already
        // existed and we can just start working.
        db_hook.onsuccess = function() {
            si.on_load(db_hook.result);
        };
    };

    StorageInstance.prototype.on_load = function(db) {
        this.db = db;
        console.log("database opened.");
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

    Table.prototype.set = function(key, value, cb) {
        var tx = this.si.transaction(this.table_name);
        var store = tx.objectStore("keys");
        var index = store.index("by_key");

        var request = index.openCursor(IDBKeyRange.only(key));
        request.onsuccess = function() {
            var cursor = request.result;

            var new_value = {'key':key, 'value':value, 'type':'string'};

            if (cursor) {
                cursor.update(new_value);
            } else {
                store.put(new_value)
                tx.oncomplete = function() {
                    if (cb) {
                        cb(key, new_value);
                    }
                };
            }
        }
    };

    var handle_result = function(request, key, callback) {
        return (function() {
            var matching = request.result;
            if (matching !== undefined) {
                // A match was found.
                if (callback) {
                    callback(key, matching);
                } else {
                    console.log("Console: " + key + " == " + matching.value + " (" + matching.type + ").");
                }
            } else {
                // No match was found.
                if (callback) {
                    callback(key, matching);
                } else {
                    console.log("Console: " + key + " == " + null + " (" + null + ").");
                }
            }
        })
    };

    Table.prototype.get = function(key, cb) {
        var tx = this.si.transaction(this.table_name);
        var store = tx.objectStore("keys");
        var index = store.index("by_key");
        
        var request = index.get(key);
        request.onsuccess = handle_result(request, key, cb);
    };

    Table.prototype.lpush = function(key, cb) {
        var tx = this.si.transaction(this.table_name);
        var store = tx.objectStore("keys");
        var index = store.index("by_key");

        var request = index.get(key);
    };

    return {
        "Storage":StorageInstance
    };
})();

if (typeof jsredis_module !== 'undefined') {
    jsredis_module.exports.storage = storage;
}
