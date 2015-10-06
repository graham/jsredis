/*
Copyright [2015] [Graham Abbott <graham.abbott@gmail.com>]

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

var LoudPromise = function(callback) {
    var p = new Promise(callback);
    p.then(function() {}, function(error) {
        console.log("ERROR: " + error);
    });
    return p;
}

var jsredis = (function(options) {
    if (!options) {
        options = {};
    }

    var JSON_START_CHAR = '!';
    var DEBUG = options['debug'] || false;
    var TIMEOUT = options['timeout'] || 0;

    var UpdateCollector = function(options) {
        var callback = options['callback'];
        var timeout_interval = options['timeout'] || 1000;
        var continue_loop = options['is_loop'] || true;
    
        this.updates = {};
        this.timeout = null;
        this.continue_loop = continue_loop;
        this.callback = callback;
        this.init_loop();
    }

    UpdateCollector.prototype.init_loop = function() {
        if (this.timeout) {
            return;
        }
    
        var _this = this;
        this.timeout = setTimeout(function() {
            _this.process();
        }, timeout_interval);
    };

    UpdateCollector.prototype.set = function(key, value) {
        this.updates[key] = value;
    };

    UpdateCollector.prototype.process = function() {
        this.timeout = null;
    
        var cb = this.callback;
        cb(this.updates);
        this.updates = [];

        if (this.continue_loop) {
            this.init_loop();
        }
    };

    var InterruptTimer = function(callback, timeout) {
        this.callback = callback;
        this.timeout = timeout;
        this.timeout_id = null;
        this.has_called = false;
    };

    InterruptTimer.prototype.start = function() {
        var _this = this;
        if (this.timeout > 0) {
            this.timeout_id = setTimeout(function() { _this.cancel(); }, this.timeout);
        }        
    };

    InterruptTimer.prototype.cancel = function() {
        if (this.has_called) {
            return
        }
        this.has_called = true;
        clearTimeout(this.timeout_id);
        this.callback(undefined);
    };

    InterruptTimer.prototype.fire = function(value) {
        if (this.has_called) {
            return
        }
        this.has_called = true;
        clearTimeout(this.timeout_id);
        this.callback(value);
    };
    
    var PromiseValue = function() {
        var _this = this;
        var _the_value = null;
        this.internal_promise = new Promise(function(resolve, reject) {
            _this.resolve = resolve;
            _this.reject = reject;
        });
    };

    PromiseValue.prototype.then = function(good, bad) {
        return this.internal_promise.then(good, bad);
    };

    PromiseValue.prototype.resolve = function(value) {
        this._the_value = value;
        return this.resolve(value);
    };

    PromiseValue.prototype.reject = function(err) {
        this._the_value = 'error';
        return this.reject(err);
    };

    var Cursor = function(connector) {
        this.connector = connector;
        this.command_queue = [];
        this.blocking_calls = [];
        this.timeout_runner = null;
        this.ready = connector.ready;
    };

    Cursor.prototype.cmd = function() {
        var args = Array.prototype.slice.call(arguments);
        var result = new PromiseValue();
        this.command_queue.push([args, result]);
        this.process();
        return result;
    };

    Cursor.prototype.process = function() {
        if (this.timeout_runner == null) {
            var _this = this;
            this.timeout_runner = setTimeout(function() {
                _this._process();
            }, TIMEOUT);
        }
    };

    Cursor.prototype._process = function() {
        this.timeout_runner = null;
        if (this.command_queue.length == 0) {
            return;
        }
    
        var next_command = this.command_queue[0];
        this.command_queue = this.command_queue.slice(1);
    
        var args = next_command[0];
        var result_promise = next_command[1];
        var _this = this;
    
        this.connector.run(args).then(function(return_data) {
            result_promise.resolve(return_data);
            _this._process();
        });
    };

    Cursor.prototype.all = function(funcs) {
        return Promise.all(funcs);
    };
    
    var general_failure = function(promise, conn, args) {
        console.log("Promise Failure: " + promise + " with " + args);
    };

    var Connector = function() {
        this.change_event_manager = [];
        this.add_change_event_manager = [];
    };

    Connector.prototype.key_changed = function(key) {
        if (DEBUG) {
            console.log("Key `" + key + "` has changed.");
        }
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
            _this.run(['set', key, JSON_START_CHAR + json_data]).then(function() {
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
                if (data[0] != JSON_START_CHAR) {
                    reject('not a json value');
                } else {
                    resolve(JSON.parse(data.slice(1)));
                }
            }, function(more) {
                general_failure(more, _this, args);
            });
        });
    };

    Connector.prototype.cmd_japply = function(_this, args) {
        return new Promise(function(resolve, reject) {
            var key = args[0];
            var func = args[1];
            _this.run(['get', key]).then(function(data) {
                if (data[0] != JSON_START_CHAR) {
                    reject('not a json value');
                } else {
                    try {
                        var new_value = func(JSON.parse(data.slice(1)));
                    } catch (e) {
                        reject(e, _this, args);
                        return
                    }
                    _this.run(['set', key, JSON_START_CHAR + JSON.stringify(new_value)]).then(function() {
                        resolve(new_value);
                    });
                }
            }, function(more) {
                general_failure(more, _this, args);
            });
        });
    };

    Connector.prototype.cmd_lpush = function(_this, args) {
        return new Promise(function(resolve, reject) {
            _this.run(['get', args[0]]).then(function(data) {
                if (data == undefined) {
                    _this.run(['set', args[0], JSON_START_CHAR + JSON.stringify(args.slice(1))]).then(function() {
                        _this.unblocking_key_change(args[0]);
                        resolve();
                    });
                } else if (data[0] != JSON_START_CHAR) {
                    resolve("Wrong type: " + data);
                } else {
                    var prev = JSON.parse(data.slice(1)); // slice is for the JSON_START_CHAR
                    var next = args.slice(1).concat(prev);
                    _this.run(['set', args[0], JSON_START_CHAR + JSON.stringify(next)]).then(function() {
                        _this.unblocking_key_change(args[0]);                    
                        resolve();
                    });
                }
            });
        });
    };

    Connector.prototype.cmd_rpush = function(_this, args) {
        return new Promise(function(resolve, reject) {
            _this.run(['get', args[0]]).then(function(data) {
                if (data == undefined) {
                    _this.run(['set', args[0], JSON_START_CHAR + JSON.stringify(args.slice(1))]).then(function() {
                        _this.unblocking_key_change(args[0]);
                        resolve();
                    });
                } else if (data[0] != JSON_START_CHAR) {
                    resolve("Wrong type: " + data);
                } else {
                    var prev = JSON.parse(data.slice(1)); // slice is for the JSON_START_CHAR
                    var next = prev.concat(args.slice(1));
                    _this.run(['set', args[0], JSON_START_CHAR + JSON.stringify(next)]).then(function() {
                        _this.unblocking_key_change(args[0]);                    
                        resolve();
                    });
                }
            });
        });
    };

    Connector.prototype.cmd_lpop = function(_this, args) {
        return new Promise(function(resolve, reject) {
            _this.run(['get', args[0]]).then(function(data) {
                if (data == undefined) {
                    resolve(undefined);
                } else if (data[0] != JSON_START_CHAR) {
                    resolve("Wrong type: " + data);
                } else {
                    var prev = JSON.parse(data.slice(1)); // slice is for the JSON_START_CHAR
                    var next = prev.slice(1);
                    _this.run(['set', args[0], JSON_START_CHAR + JSON.stringify(next)]).then(function() {
                        resolve(prev[0]);
                    });
                }
            });
        });
    };

    Connector.prototype.cmd_rpop = function(_this, args) {
        return new Promise(function(resolve, reject) {
            _this.run(['get', args[0]]).then(function(data) {
                if (data == undefined) {
                    resolve(undefined);
                } else if (data[0] != JSON_START_CHAR) {
                    resolve("Wrong type: " + data);
                } else {
                    var prev = JSON.parse(data.slice(1)); // slice is for the JSON_START_CHAR
                    var next = prev.slice(0, prev.length-1);
                    _this.run(['set', args[0], JSON_START_CHAR + JSON.stringify(next)]).then(function() {
                        resolve(prev[prev.length-1]);
                    });
                }
            });
        });
    };

    Connector.prototype.cmd_lrange = function(_this, args) {
        return new Promise(function(resolve, reject) {
            _this.run(['get', args[0]]).then(function(data) {
                if (data == undefined) {
                    resolve([]);
                } else if (data[0] != JSON_START_CHAR) {
                    resolve("Wrong type: " + data);
                } else {
                    var prev = JSON.parse(data.slice(1)); // slice is for the JSON_START_CHAR
                    var start_index = args[1];
                    var end_index = args[2];

                    if (end_index < 0) {
                        end_index += prev.length;
                    }
                    
                    resolve(prev.slice(start_index, end_index+1));
                }
            });
        });
    };

    Connector.prototype.cmd_lindex = function(_this, args) {
        return new Promise(function(resolve, reject) {
            _this.run(['get', args[0]]).then(function(data) {
                if (data == undefined) {
                    resolve([]);
                } else if (data[0] != JSON_START_CHAR) {
                    resolve("Wrong type: " + data);
                } else {
                    var prev = JSON.parse(data.slice(1)); // slice is for the JSON_START_CHAR
                    var index = args[1];

                    if (index < 0) {
                        index += prev.length;
                    }

                    resolve(prev[index]);
                }
            });
        });
    };

    Connector.prototype.cmd_llen = function(_this, args) {
        return new Promise(function(resolve, reject) {
            _this.run(['get', args[0]]).then(function(data) {
                if (data == undefined) {
                    resolve(0);
                } else if (data[0] != JSON_START_CHAR) {
                    resolve("Wrong type: " + data);
                } else {
                    var prev = JSON.parse(data.slice(1)); // slice is for the JSON_START_CHAR
                    resolve(prev.length);
                }
            });
        });
    };

    Connector.prototype.cmd_lset = function(_this, args) {
        return new Promise(function(resolve, reject) {
            _this.run(['get', args[0]]).then(function(data) {
                if (data == undefined) {
                    resolve(undefined);
                } else if (data[0] != JSON_START_CHAR) {
                    resolve("Wrong type: " + data);
                } else {
                    var index = args[1];
                    var value = args[2];
                    var prev = JSON.parse(data.slice(1)); // slice is for the JSON_START_CHAR

                    if (index < 0) {
                        index += prev.length+1;
                    }

                    prev[index] = value;
                    _this.run(['set', args[0], JSON_START_CHAR + JSON.stringify(prev)]).then(function() {
                        resolve(prev[prev.length-1]);
                    });
                }
            });
        });
    };

    Connector.prototype.cmd_lrem = function(_this, args) {
        return new Promise(function(resolve, reject) {
            _this.run(['get', args[0]]).then(function(data) {
                if (data == undefined) {
                    resolve(undefined);
                } else if (data[0] != JSON_START_CHAR) {
                    resolve("Wrong type: " + data);
                } else {
                    var index = args[1];
                    var prev = JSON.parse(data.slice(1)); // slice is for the JSON_START_CHAR
                    
                    if (index < 0) {
                        index += prev.length+1;
                    }

                    prev = prev.slice(0, index).concat(prev.slice(index+1, prev.length));
                    _this.run(['set', args[0], JSON_START_CHAR + JSON.stringify(prev)]).then(function() {
                        resolve(prev[prev.length-1]);
                    });
                }
            });
        });
    };

    Connector.prototype.cmd_blpop = function(_this, args) {
        return new Promise(function(resolve, reject) {
            var on_timeout = null;
            var keys = args.slice(0, args.length-1);
            var timeout = args[args.length-1];
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
            console.log("Command not found: " + command);
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
            _this.key_changed(key);
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
            _this.key_changed(key);
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
            console.log("Command not found: " + command);            
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
                    _this.key_changed(key);
                    resolve(new_value);
                } else {
                    store.put(new_value)
                    tx.oncomplete = function() {
                        _this.key_changed(key);
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
                    _this.key_changed(key);
                    resolve(true);
                } else {
                    _this.key_changed(key);
                    resolve(false);
                }
            }
            request.onerror = function() {
                reject(key);
            }
        });
    };

    var connect = function(quickname) {
        if (quickname == 'local') {
            var c = new Cursor( new Connector_LocalStorage() );
            c.type = 'local';
            return c;
        } else if (quickname == 'indexdb') {
            var c = new Cursor( new Connector_IndexStorage() );
            c.type = 'indexdb';
            return c;
        } else {
            throw "Unknown connector: " + quickname;
        }
    };

    return {
        'Connector':Connector,
        'Cursor':Cursor,
        'Connector_IndexStorage':Connector_IndexStorage,
        'Connector_LocalStorage':Connector_LocalStorage,
        'UpdateCollector':UpdateCollector,
        'InterruptTimer':InterruptTimer,
        'PromiseValue':PromiseValue,
        'connect':connect
    }
})();
