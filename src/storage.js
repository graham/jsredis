var l = function() {
    console.log( arguments );
}

var SimpleIndex = (function() {
    var TIMEOUT_MS = 0;
    var TIMEOUT_MS_BIG = 0;

    var CORE_COMMANDS = {};
    CORE_COMMANDS['get'] = function(si, args, result, dbhandle) {
        var tx = si.db.transaction('keys', 'readwrite');        
        var key = args[0];
        var store = tx.objectStore("keys");
        var index = store.index("by_key");
            
        var request = index.get(key);
        request.onsuccess = function() {
            var matching = request.result;
            if (!matching) {
                result.resolve(undefined);
            } else {
                result.resolve(matching.value);
            }
            dbhandle.resolve();
        }
        request.onerror = function() {
            result.reject(key);
            dbhandle.resolve();
        }
    };

    CORE_COMMANDS['exists'] = function(si, args, result, dbhandle) {
        var tx = si.db.transaction('keys', 'readwrite');        
        var key = args[0];
        var store = tx.objectStore("keys");
        var index = store.index("by_key");
            
        var request = index.get(key);
        request.onsuccess = function() {
            var matching = request.result;
            if (!matching) {
                result.resolve(false);
            } else {
                result.resolve(true);
            }
            dbhandle.resolve();
        }
        request.onerror = function() {
            result.reject(key);
            dbhandle.resolve();
        }
    };

    CORE_COMMANDS['set'] = function(si, args, result, dbhandle) {
        var tx = si.db.transaction('keys', 'readwrite');
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
                result.resolve(value);
                dbhandle.resolve();
            } else {
                store.put(new_value)
                tx.oncomplete = function() {
                    result.resolve(value);
                    dbhandle.resolve();
                };
            }
        };
        
        request.onerror = function() {
            result.reject(key);
            dbhandle.resolve();
        };
    };

    CORE_COMMANDS['del'] = function(si, args, result, dbhandle) {
        var tx = si.db.transaction('keys', 'readwrite');
        var key = args[0];

        var store = tx.objectStore("keys");
        var index = store.index("by_key");
        var request = index.openCursor(IDBKeyRange.only(key));
        
        request.onsuccess = function() {
            var cursor = request.result;
            
            if (cursor) {
                store.delete(key);
                result.resolve(true);
                dbhandle.resolve();
            } else {
                store.del(key);
                tx.oncomplete = function() {
                    result.resolve(false);
                    dbhandle.resolve();
                };
            }
        };
        
        request.onerror = function() {
            result.reject(key);
            dbhandle.resolve();
        };
    };

    
    CORE_COMMANDS['keys'] = function(si, args, result, dbhandle) {
        var tx = si.db.transaction('keys', 'readwrite');

        var store = tx.objectStore("keys");
        var index = store.index("by_key");
        var request = index.openCursor();

        var collector = [];
        
        request.onsuccess = function() {
            var cursor = request.result;
            
            if (cursor) {
                collector.push(cursor.key);
                cursor.continue();
            } else {
                result.resolve(collector);
                dbhandle.resolve();
            }
        };
        
        request.onerror = function() {
            result.reject(key);
            dbhandle.resolve();
        };
    };

    
    var Simple = function(name) {
        this.name = name;
        this.db = null;

        this.command_queue = [];
        this.looper = null;
        this.COMMANDS = CORE_COMMANDS;
    };

    Simple.prototype.init_db = function(name) {
        if (name != undefined) {
            this.name = name;
        }
        var _this = this;
        
        if (this.db) {
            this.close();
        }
        
        this.db = null;
        this.command_queue = [];
        
        this.ready = new Promise(function(resolve, reject) {
            var db_hook = indexedDB.open(_this.name);
            
            // This will only be called if the database didn't previously exist
            // or if the version number has changed.
            db_hook.onupgradeneeded = function() {
                var db = db_hook.result;
                
                var store = db.createObjectStore("keys", {keyPath: "key"});
                var keyIndex = store.createIndex("by_key", "key", {unique:true});

                _this.db = db;
                //console.log("Simple Database created.");
                setTimeout(resolve, TIMEOUT_MS);
            };
            
            // We've successfully connected to the database, because it already
            // existed and we can just start working.
            db_hook.onsuccess = function() {
                //console.log('Connected to database.');
                _this.db = db_hook.result;
                setTimeout(resolve, TIMEOUT_MS);
                //_this.process();
            };
            
            db_hook.onerror = function() {
                console.log(db_hook.error);
                reject();
            };
        });
        return this.ready;
    };

    Simple.prototype.cmd = function() {
        var newargs = Array.prototype.slice.call(arguments);
        var result = new PromiseValue();
        this.command_queue.push([newargs[0], newargs.slice(1), result]);
        this.process();
        return result.internal_promise;
    };

    Simple.prototype.prep = function() {
        var newargs = Array.prototype.slice.call(arguments);
        var result = new PromiseValue();
        this.command_queue = [[newargs[0], newargs.slice(1), result]].concat(this.command_queue);
        this.process();
        return result.internal_promise;
    };
    
    Simple.prototype.get = function(key) {
        return this.cmd('get', key);
    };

    Simple.prototype.set = function(key, value) {
        return this.cmd('set', key, value);
    };

    Simple.prototype.exists = function(key) {
        return this.cmd('exists', key);
    };

    Simple.prototype.del = function(key) {
        return this.cmd('del', key);
    };

    Simple.prototype.keys = function(match) {
        return this.cmd('keys', match);
    };

    Simple.prototype.reset_all_data = function(count) {
        this.command_queue = [];
        if (this.looper) {
            clearTimeout(this.looper);
        }
        this.looper = null;
        
        if (count == undefined) { count = 1; }
        var _this = this;
        
        if (this.db) { this.close(); }
        
        this.db = null;

        return new Promise(function(resolve, reject) {
            setTimeout(function() {
                var req = indexedDB.deleteDatabase( _this.name );
            
                req.onsuccess = function () {
                    //console.log('reset successful.');
                    setTimeout(resolve, TIMEOUT_MS);
                };
                req.onerror = function () {
                    console.log('reset error');                
                    setTimeout(reject, TIMEOUT_MS);
                };
                req.onblocked = function () {
                    console.log(this);
                    console.log('reset blocked');
                    if (count > 10) {
                        setTimeout(reject, TIMEOUT_MS);
                    } else {
                        setTimeout(function() { _this.reset_all_data(count+1); }, TIMEOUT_MS_BIG);
                    }
                };
            }, TIMEOUT_MS+1);
        });
    };

    Simple.prototype.consume_queue = function() {
        var _this = this;

        if (this.db == null) {
            // happens if there is an error or if the db is reset.
            return;
        }
        
        if (this.command_queue.length > 0) {
            var command = this.command_queue[0];
            this.command_queue = this.command_queue.slice(1);

            var callback = _this.COMMANDS[command[0]];
            if (callback == undefined) {
                throw "Undefined command: " + command[0];
            }

            var args = command[1];
            var dbhandle = new PromiseValue();
            
            var result_promise = command[2];
            var p = callback(_this, args, result_promise, dbhandle);
            
            dbhandle.then(function() {
                _this.looper = setTimeout(function() { _this.consume_queue(); }, TIMEOUT_MS);
            });
        } else {
            clearTimeout(_this.looper);
            _this.looper = null;
        }
    };

    Simple.prototype.process = function() {
        if (this.db == null) {
            return;
        }
        var _this = this;
        if (this.looper == null) {
            this.looper = setTimeout(function() { _this.consume_queue(); }, TIMEOUT_MS);
        }
    };

    Simple.prototype.close = function() {
        this.command_queue = [];
        clearTimeout(this.looper);
        if (this.db) {
            this.db.close();
            this.db = null;
        }
    };

    Simple.prototype.all = function(good, bad) {
        return Promise.all(good, bad);
    };
    
    return Simple;
})();

var SimpleRedis = (function() {
    var SimpleRedisCore = function(name) {
        this.name = name;

        this.COMMANDS['setnx'] = function(si, args, result, dbhandle) {
            var tx = si.db.transaction('keys', 'readwrite');
            var key = args[0];
            var value = args[1];
            
            var store = tx.objectStore("keys");
            var index = store.index("by_key");
            var request = index.openCursor(IDBKeyRange.only(key));
            
            request.onsuccess = function() {
                var cursor = request.result;
                var new_value = {'key':key, 'value':value, 'type':value.constructor.name};
                
                if (cursor) {
                    result.resolve(0);
                    dbhandle.resolve();
                } else {
                    store.put(new_value)
                    tx.oncomplete = function() {
                        result.resolve(1);
                        dbhandle.resolve();
                    };
                }
            };
            
            request.onerror = function() {
                result.reject(key);
                dbhandle.resolve();
            };
        };

        this.COMMANDS['rpush'] = function(si, args, result, dbhandle) {
            si.prep('get', args[0]).then(function(r) {
                if (r == undefined) {
                    // key doesn't exist yet.
                    var nargs = args.slice(1);
                    si.prep('set', args[0], JSON.stringify(nargs));
                    result.resolve(nargs.length);
                } else {
                    var nargs = args.slice(1);
                    var prev = JSON.parse(r);
                    var newval = prev.concat(nargs);
                    si.prep('set', args[0], JSON.stringify(newval));
                    result.resolve(newval.length);
                }
            });
            dbhandle.resolve();
        };
        
        this.COMMANDS['lpush'] = function(si, args, result, dbhandle) {
            si.prep('get', args[0]).then(function(r) {
                if (r == undefined) {
                    // key doesn't exist yet.
                    var nargs = args.slice(1);
                    si.prep('set', args[0], JSON.stringify(nargs));
                    result.resolve(nargs.length);
                } else {
                    var nargs = args.slice(1);
                    var prev = JSON.parse(r);
                    var newval = nargs.concat(prev);
                    si.prep('set', args[0], JSON.stringify(newval));
                    result.resolve(newval.length);
                }
            });
            dbhandle.resolve();
        };
        
        this.COMMANDS['lpop'] = function(si, args, result, dbhandle) {
            si.prep('get', args[0]).then(function(r) {
                if (r == undefined) {
                    // key doesn't exist yet.
                    var nargs = args.slice(1);
                    si.prep('set', args[0], JSON.stringify(nargs));
                    result.resolve(undefined);
                } else {
                    var nargs = args.slice(1);
                    var prev = JSON.parse(r);
                    var ret = prev[0];
                    var newval = prev.slice(1);
                    si.prep('set', args[0], JSON.stringify(newval));
                    result.resolve(ret);
                }
            });
            dbhandle.resolve();        
        };
        
        this.COMMANDS['rpop'] = function(si, args, result, dbhandle) {
            si.prep('get', args[0]).then(function(r) {
                if (r == undefined) {
                    // key doesn't exist yet.
                    var nargs = args.slice(1);
                    si.prep('set', args[0], JSON.stringify(nargs));
                    result.resolve(undefined);
                } else {
                    var nargs = args.slice(1);
                    var prev = JSON.parse(r);
                    var ret = prev[prev.length-1];
                    var newval = prev.slice(0,prev.length-1);
                    si.prep('set', args[0], JSON.stringify(newval));
                    result.resolve(ret);
                }
            });
            dbhandle.resolve();        
        };

        this.COMMANDS['lindex'] = function(si, args, result, dbhandle) {
            si.prep('get', args[0]).then(function(r) {
                if (r == undefined) {
                    // key doesn't exist yet.
                    result.resolve(undefined);
                } else {
                    var nargs = args.slice(1);
                    var prev = JSON.parse(r);
                    var index = args[1];
                    if (index < 0) {
                        index = prev.length + index;
                    }
                    result.resolve(prev[index]);
                }
            });
            dbhandle.resolve();        
        };

        this.COMMANDS['lrem'] = function(si, args, result, dbhandle) {
            si.prep('get', args[0]).then(function(r) {
                if (r == undefined) {
                    // key doesn't exist yet.
                    result.resolve(undefined);
                } else {
                    var nargs = args.slice(1);
                    var prev = JSON.parse(r);
                    var newval = [];
                    var count = nargs[0];
                    var check = nargs[1];

                    if (count > 0) {
                        for(var i=0; i < prev.length; i++) {
                            var match = false;
                            if (check == prev[i]) {
                                match = true;
                            }

                            if (match) {
                                if (count == 0) {
                                    newval.push(prev[i]);
                                } else {
                                    count -= 1;
                                }                                    
                            } else {
                                newval.push(prev[i]);
                            }
                        }
                    } else if (count < 0) {
                        for(var i=prev.length-1; i >= 0; i--) {
                            var match = false;
                            if (check == prev[i]) {
                                match = true;
                            }

                            if (match) {
                                if (count == 0) {
                                    newval.push(prev[i]);
                                } else {
                                    count += 1;
                                }                                    
                            } else {
                                newval.push(prev[i]);
                            }
                        }

                        newval.reverse();
                    } else if (count == 0) {
                        for(var i=0; i < prev.length; i++) {
                            var match = false;
                            if (check == prev[i]) {
                                match = true;
                            }
                            
                            if (!match) {
                                newval.push(prev[i]);
                            }
                        }
                    }

                    si.prep('set', args[0], JSON.stringify(newval));
                    result.resolve(count);
                }
            });
            dbhandle.resolve();        
        };
        
        this.COMMANDS['llen'] = function(si, args, result, dbhandle) {
            si.prep('get', args[0]).then(function(r) {
                if (r == undefined) {
                    // key doesn't exist yet.
                    result.resolve(undefined);
                } else {
                    var nargs = args.slice(1);
                    var prev = JSON.parse(r);
                    result.resolve(prev.length);
                }
            });
            dbhandle.resolve();        
        };

        this.COMMANDS['lset'] = function(si, args, result, dbhandle) {
            si.prep('get', args[0]).then(function(r) {
                if (r == undefined) {
                    // key doesn't exist yet.
                    result.resolve(undefined);
                } else {
                    var nargs = args.slice(1);
                    var prev = JSON.parse(r);
                    var index = args[1];
                    var value = args[2];
                    if (index < 0) {
                        index = prev.length + index;
                    }
                    prev[index] = value;
                    si.prep('set', args[0], JSON.stringify(prev)).then(function() {
                        result.resolve(prev[index]);
                    });
                }
            });
            dbhandle.resolve();        
        };

        this.COMMANDS['lrange'] = function(si, args, result, dbhandle) {
            si.prep('get', args[0]).then(function(r) {
                if (r == undefined) {
                    // key doesn't exist yet.
                    result.resolve(undefined);
                } else {
                    var nargs = args.slice(1);
                    var prev = JSON.parse(r);
                    var start_index = args[1];
                    var end_index = args[2];
                    
                    if (start_index < 0) {
                        start_index = prev.length + start_index;
                    }

                    if (end_index < 0) {
                        end_index = prev.length + end_index;
                    }

                    result.resolve(prev.slice(start_index, end_index+1));
                }
            });
            dbhandle.resolve();        
        };

        
    };

    

    SimpleRedisCore.prototype = new SimpleIndex(false);

    return SimpleRedisCore;
})();

if (typeof jsredis_module !== 'undefined') {
    jsredis_module.exports.storage = storage;
}

