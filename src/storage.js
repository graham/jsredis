var DEBUG = true;
var log = function() {
    for(var i = 0; i < arguments.length; i++) {
        console.log(arguments[i]);
    }
};

var PromiseValue = function() {
        var _this = this;
        this.internal_promise = new Promise(function(resolve, reject) {
            _this.resolve = resolve;
            _this.reject = reject;
        });
    };

PromiseValue.prototype.then = function(good, bad) {
    this.internal_promise.then(good, bad);
};

PromiseValue.prototype.resolve = function(value) {
    this.resolve(value);
};

PromiseValue.prototype.reject = function(err) {
    this.reject(err);
};


var storage = (function() {
    var COMMANDS = {};
    var TIMEOUT_MS = 5;

    COMMANDS['wait'] = function(si, tx, args, result, dbhandle) {
        var value = parseInt(args[0]);
        if (isNaN(value)) {
            value = 1000;
        }

        dbhandle.resolve();
        setTimeout(function() {
            result.resolve('100');
        }, value);
    };

    COMMANDS['get'] = function(si, tx, args, result, dbhandle) {
        var key = args[0];
        var store = tx.objectStore("keys");
        var index = store.index("by_key");
            
        var request = index.get(key);
        request.onsuccess = function() {
            var matching = request.result;
            result.resolve(matching);
            dbhandle.resolve();
        }
        request.onerror = function() {
            result.reject(key);
            dbhandle.resolve();
        }
    };

    COMMANDS['set'] = function(si, tx, args, result, dbhandle) {
        var key = args[0];
        var value = args[1];

        var store = tx.objectStore("keys");
        var index = store.index("by_key");
        var request = index.openCursor(IDBKeyRange.only(key));
        
        request.onsuccess = function() {
            var cursor = request.result;
            var new_value = {'key':key, 'value':value, 'type':value.constructor.name};
            
            if (cursor) {
                cursor.update(new_value);
                result.resolve(new_value);
                dbhandle.resolve();
            } else {
                store.put(new_value)
                tx.oncomplete = function() {
                    result.resolve(new_value);
                    dbhandle.resolve();
                };
            }
        };
        
        request.onerror = function() {
            result.reject(key);
            dbhandle.resolve();
        };
    };

    COMMANDS['rpush'] = function(si, tx, args, result, dbhandle) {
        si.cmd('get', args[0]).then(function(r) {
            if (r == undefined) {
                // key doesn't exist yet.
                var nargs = args.slice(1);
                si.cmd('set', args[0], JSON.stringify(nargs));
                result.resolve(nargs.length);
            } else {
                var nargs = args.slice(1);
                var prev = JSON.parse(r.value);
                var newval = prev.concat(nargs);
                si.cmd('set', args[0], JSON.stringify(newval));
                result.resolve(newval.length);
            }
        });
        dbhandle.resolve();
    };

    COMMANDS['lpush'] = function(si, tx, args, result, dbhandle) {
        si.cmd('get', args[0]).then(function(r) {
            if (r == undefined) {
                // key doesn't exist yet.
                var nargs = args.slice(1);
                si.cmd('set', args[0], JSON.stringify(nargs));
                result.resolve(nargs.length);
            } else {
                var nargs = args.slice(1);
                var prev = JSON.parse(r.value);
                var newval = nargs.concat(prev);
                si.cmd('set', args[0], JSON.stringify(newval));
                result.resolve(newval.length);
            }
        });
        dbhandle.resolve();
    };

    COMMANDS['lpop'] = function(si, tx, args, result, dbhandle) {
        si.cmd('get', args[0]).then(function(r) {
            if (r == undefined) {
                // key doesn't exist yet.
                var nargs = args.slice(1);
                si.cmd('set', args[0], JSON.stringify(nargs));
                result.resolve(undefined);
            } else {
                var nargs = args.slice(1);
                var prev = JSON.parse(r.value);
                var ret = prev[0];
                var newval = prev.slice(1);
                si.cmd('set', args[0], JSON.stringify(newval));
                result.resolve(ret);
            }
        });
        dbhandle.resolve();        
    };

    COMMANDS['rpop'] = function(si, tx, args, result, dbhandle) {
        si.cmd('get', args[0]).then(function(r) {
            if (r == undefined) {
                // key doesn't exist yet.
                var nargs = args.slice(1);
                si.cmd('set', args[0], JSON.stringify(nargs));
                result.resolve(undefined);
            } else {
                var nargs = args.slice(1);
                var prev = JSON.parse(r.value);
                var ret = prev[prev.length-1];
                var newval = prev.slice(0,prev.length-1);
                si.cmd('set', args[0], JSON.stringify(newval));
                result.resolve(ret);
            }
        });
        dbhandle.resolve();        
    };

    var StorageInstance = function(dbn) {
        this.events = {};
        this.ready = new PromiseValue();
        
        if (dbn != undefined) {
            this.dbname = dbn;
        } else {
            this.dbname = 'jsredis_storage';
        }

        this.command_queue = [];
        this.process_next_flag = 0;
        this.looper = null;
    };

    StorageInstance.prototype.init_db = function() {
        var si = this;
        if (this.db) { this.db.close(); }
        this.db = null;

        var p = new Promise(function(resolve, reject) {
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
                console.log("database created");
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

        p.then(function() {
            si.ready.resolve();
        });
        
        return p;
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
    
    StorageInstance.prototype.transaction = function(table) {
        return this.db.transaction(table, "readwrite");
    };

    StorageInstance.prototype.consume_queue = function() {
        var _this = this;
        
        if (this.command_queue.length > 0) {
            var command = this.command_queue[0];
            this.command_queue = this.command_queue.slice(1);

            var result_promise = command[0];
            
            var callback = COMMANDS[command[1]];
            if (callback == undefined) {
                throw "Undefined command: " + command[0];
            }

            var args = command[2];
            var dbhandle = new PromiseValue();
            var p = callback(_this, this.transaction('keys'), args, result_promise, dbhandle);
            
            dbhandle.then(function() {
                _this.looper = setTimeout(function() { _this.consume_queue(); }, TIMEOUT_MS);
            });
        } else {
            console.log("Empty Queue.");
            _this.looper = null;
        }
    };

    StorageInstance.prototype.process = function() {
        var _this = this;
        this.process_next_flag += 1;
        if (this.looper == null) {
            this.looper = setTimeout(function() { _this.consume_queue(); }, TIMEOUT_MS);
        }
    };

    StorageInstance.prototype.set = function(key, value) {
        var result = new PromiseValue();
        this.command_queue.push([result, 'set', [key, value]]);
        this.process();
        return result;
    };

    StorageInstance.prototype.get = function(key) {
        var result = new PromiseValue();
        this.command_queue.push([result, 'get', [key]]);
        this.process();
        return result;
    };

    StorageInstance.prototype.cmd = function() {
        var newargs = Array.prototype.slice.call(arguments);
        var result = new PromiseValue();
        this.command_queue.push([result, newargs[0], newargs.slice(1)]);
        this.process();
        return result;
    };

    StorageInstance.prototype.prep = function() {
        var newargs = Array.prototype.slice.call(arguments);
        var result = new PromiseValue();
        this.command_queue = [[result, newargs[0], newargs.slice(1)]].concat(this.command_queue);
        this.process();
        return result;
    };

    return {
        "Storage":StorageInstance
    };
})();

if (typeof jsredis_module !== 'undefined') {
    jsredis_module.exports.storage = storage;
}

