var l = function() {
    console.log( arguments );
}

var Redis = (function() {
    Promise.prototype.log = function() {
        this.then(function(args) {
            console.log("Resolve: " + args);
        }, function(args) {
            console.log("Reject: " + args);
            throw args;
        });
    };

    var StoragePlugin = function() {};
    StoragePlugin.prototype.init = function() {};
    StoragePlugin.prototype.get = function() {};
    StoragePlugin.prototype.set = function() {};
    StoragePlugin.prototype.update = function() {};
    StoragePlugin.prototype.remove = function() {};
    StoragePlugin.prototype.keys = function() {};

    var LocalStoragePlugin = function(is_session) {
        if (is_session == true) {
            this.conn = sessionStorage;
        } else {
            this.conn = localStorage;
        }
        this.init();
    };

    LocalStoragePlugin.prototype.init = function() {
        this.ready = new Promise(function(resolve, reject) {
            resolve();
        });
    };
    
    LocalStoragePlugin.prototype.get = function(key) {
        var plugin = this;
        return new Promise(function(resolve, reject) {
            var value = plugin.conn.getItem(key);
            if (value == null) {
                value = undefined;
            }
            resolve(value);            
        });
    };

    LocalStoragePlugin.prototype.set = function(key, value) {
        var plugin = this;        
        return new Promise(function(resolve, reject) {
            plugin.conn.setItem(key, value);
            resolve(value);
        });
    };

    LocalStoragePlugin.prototype.update = function(key, cb) {
        var plugin = this;        
        return new Promise(function(resolve, reject) {
            var value = plugin.conn.getItem(key);
            var result = null;

            try {
                result = cb(value);
            } catch (e) {
                reject(e);
            }

            var new_value = result[0];
            var return_value = result[1];

            if (new_value != undefined) {
                plugin.conn.setItem(key, new_value);
            }
            resolve(return_value);
            return return_value;
        });
    };

    LocalStoragePlugin.prototype.remove = function(key) {
        var plugin = this;        
        return new Promise(function(resolve, reject) {
            plugin.conn.removeItem(key);
            resolve();
        });
    };

    LocalStoragePlugin.prototype.keys = function() {
        var plugin = this;
        return new Promise(function(resolve, reject) {
            var keys = [];
            for (var key in plugin.conn){
                keys.push(key);
            }
            resolve(keys);
        });
    }

    var Cursor = function(plugin) {
        this.plugin = plugin;
        this.command_queue = [];
        this.looper = null;
        this.ready = null;
        this.init();
    };
    
    Cursor.prototype.all = function(good, bad) {
        return Promise.all(good, bad);
    };

    Cursor.prototype.init = function() {
        this.plugin.init();
        this.ready = new Promise(function(resolve, reject) {
            resolve();
        });
    };

    Cursor.prototype.get = function(key) {
        return this.plugin.get(key);
    };

    Cursor.prototype.set = function(key, value) {
        return this.plugin.set(key, value);
    };

    Cursor.prototype.incr = function(key) {
        return this.plugin.update(key, function(prev_value) {
            var int_value = parseInt(prev_value);
            if (isNaN(int_value)) {
                throw "Calling incr on '" + key + "': " + prev_value + " is NaN.";
            } else {
                return [int_value + 1, prev_value];
            }
        });
    };

    Cursor.prototype.incrby = function(key, increment) {
        return this.plugin.update(key, function(prev_value) {
            var int_value = parseInt(prev_value);
            if (isNaN(int_value)) {
                throw "Calling incrby on '" + key + "': " + prev_value + " is NaN.";
            } else {
                return [int_value + increment, prev_value];
            }
        });
    };

    Cursor.prototype.decr = function(key) {
        return this.plugin.update(key, function(prev_value) {
            var int_value = parseInt(prev_value);
            if (isNaN(int_value)) {
                throw "Calling decr on '" + key + "': " + prev_value + " is NaN.";
            } else {
                return [int_value - 1, prev_value];
            }
        });
    };

    Cursor.prototype.decrby = function(key, increment) {
        return this.plugin.update(key, function(prev_value) {
            var int_value = parseInt(prev_value);
            if (isNaN(int_value)) {
                throw "Calling decrby on '" + key + "': " + prev_value + " is NaN.";
            } else {
                return [int_value - increment, prev_value];
            }
        });
    };

    Cursor.prototype.flushdb = function() {
        var plugin = this.plugin;
        return new Promise(function(resolve, reject) {
            plugin.conn.clear();
            setTimeout(function() {
                resolve();
            }, 100);
        });
    }

    Cursor.prototype.exists = function(key) {
        var plugin = this.plugin;
        return new Promise(function(resolve, reject) {
            plugin.get(key).then(function(result) {
                if (result == null || result == undefined) {
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        });
    }

    Cursor.prototype.keys = function() {
        return this.plugin.keys();
    };

    Cursor.prototype.del = function(key) {
        return this.plugin.remove(key);
    };

    Cursor.prototype.append = function(key, value) {
        return this.plugin.update(key, function(prev_value) {
            if (!prev_value) {
                prev_value = '';
            }
            var new_value = prev_value + value;
            return [new_value, new_value.length];
        });
    };

    Cursor.prototype.mset = function() {
        var all = [];

        for(var i=0; i < arguments.length; i += 2) {
            var key = arguments[i];
            var value = arguments[i+1];
            all.push(this.plugin.set(key, value));
        }
        return Promise.all(all);
    };

    Cursor.prototype.msetnx = function() {
        var _this = this;
        var plugin = this.plugin;
        var args = arguments;
        return new Promise(function(resolve, reject) {
            var all = [];
            
            for(var i=0; i < args.length; i += 2) {
                var key = args[i];
                var value = args[i+1];
                all.push(_this.exists(key));
            }
            
            Promise.all(all).then(function(results) {
                var hit = false;
                for(var i = 0; i < results.length; i++) {
                    if (results[i] == true) {
                        hit = true;
                    }
                }
                if (hit == false) {
                    var set_all = [];
                    for(var i=0; i < args.length; i += 2) {
                        var key = args[i];
                        var value = args[i+1];
                        set_all.push(plugin.set(key));
                    }
                    Promise.all(set_all).then(function() {
                        resolve(1);
                    });
                } else {
                    resolve(0);
                }
            });
        });
    };

    Cursor.prototype.mget = function() {
        var all = [];

        for(var i=0; i < arguments.length; i++) {
            var key = arguments[i];
            all.push(this.plugin.get(key));
        }
        return Promise.all(all);
    };

    Cursor.prototype.setnx = function(key, value) {
        return this.plugin.update(key, function(prev_value) {
            if (!prev_value) {
                return [value, 1];
            } else {
                return [undefined, 0];
            }
        });
    };

    Cursor.prototype.strlen = function(key) {
        return new Promise(function(resolve, reject) {
            plugin.get(key).then(function(result) {
                if (result == null) {
                    resolve(0);
                } else {
                    resolve(result.length);
                }
            });
        });
    };

    Cursor.prototype.rename = function(key, newkey) {
        var plugin = this.plugin;
        return new Promise(function(resolve, reject) {
            plugin.get(key).then(function(value) {
                plugin.set(newkey, value).then(function() {
                    resolve();
                });
            });
        });
    };

    Cursor.prototype.renamenx = function(key, newkey) {
        var plugin = this.plugin;
        return new Promise(function(resolve, reject) {
            plugin.get(key).then(function(value) {
                if (!value) {
                    plugin.set(newkey, value).then(function() {
                        resolve(1);
                    });
                } else {
                    resolve(0);
                };
            });
        });
    };

    Cursor.prototype.getrange = function(key, start, end) {};
    Cursor.prototype.setrange = function(key, offset, value) {};
    Cursor.prototype.lrem = function() {};
    
    Cursor.prototype.lindex = function(key, index) {
        var plugin = this.plugin;
        return new Promise(function(resolve, reject) {
            plugin.get(key).then(function(value) {
                value = JSON.parse(value);
                if (index < 0) {
                    index = value.length + index;
                }
                resolve(value[index]);
            });
        });
    };

    Cursor.prototype.lrange = function(key, start, stop) {
        var plugin = this.plugin;
        return new Promise(function(resolve, reject) {
            plugin.get(key).then(function(prev_value) {
                if (!prev_value) {
                    prev_value = [];
                } else {
                    prev_value = JSON.parse(prev_value);
                }
                if (stop < 0) {
                    stop = prev_value.length + (stop+1);
                } else {
                    stop += 1;
                }
                resolve(prev_value.slice(start, stop));
            });
        });
    };

    Cursor.prototype.llen = function(key, index) {
        var plugin = this.plugin;
        return new Promise(function(resolve, reject) {
            plugin.get(key).then(function(value) {
                value = JSON.parse(value);
                resolve(value.length);
            });
        });
    };

    Cursor.prototype.lset = function(key, index, value) {
        var plugin = this.plugin;
        return new Promise(function(resolve, reject) {
            plugin.update(key, function(prev_value) {
                if (!prev_value) {
                    prev_value = [];
                } else {
                    prev_value = JSON.parse(prev_value);
                }
                if (index < 0) {
                    index = prev_value.length + index;
                }
                
                prev_value[index] = value
                return [JSON.stringify(prev_value), prev_value.length];
            }).then(function(value) {
                resolve(value);
            });
        });
    };

    Cursor.prototype.ltrim = function(key, start, stop) {
        var plugin = this.plugin;
        return new Promise(function(resolve, reject) {
            plugin.update(key, function(prev_value) {
                if (!prev_value) {
                    prev_value = [];
                } else {
                    prev_value = JSON.parse(prev_value);
                }
                if (stop < 0) {
                    stop = prev_value.length + (stop+1);
                }
                var new_value = prev_value.slice(start, stop);
                return [JSON.stringify(new_value), new_value.length];
            }).then(function(value) {
                resolve(value);
            });
        });
    };

    Cursor.prototype.rpush = function(key) {
        var plugin = this.plugin;
        var outer_args = Array.prototype.slice.call(arguments, 1);
        return new Promise(function(resolve, reject) {
            plugin.update(key, function(prev_value) {
                if (!prev_value) {
                    prev_value = [];
                } else {
                    prev_value = JSON.parse(prev_value);
                }
                var new_value = prev_value.concat(outer_args);
                return [JSON.stringify(new_value), new_value.length];
            }).then(function(value) {
                resolve(value);
            });
        });
    };

    Cursor.prototype.rpushx = function(key) {
        var plugin = this.plugin;
        var outer_args = Array.prototype.slice.call(arguments, 1);
        return new Promise(function(resolve, reject) {
            plugin.update(key, function(prev_value) {
                if (!prev_value) {
                    return [undefined, 0];
                } else {
                    prev_value = JSON.parse(prev_value);
                }
                var new_value = prev_value.concat(outer_args);
                return [JSON.stringify(new_value), new_value.length];
            }).then(function(value) {
                resolve(value);
            });
        });
    };

    Cursor.prototype.lpush = function(key) {
        var plugin = this.plugin;
        var outer_args = Array.prototype.slice.call(arguments, 1);
        return new Promise(function(resolve, reject) {
            plugin.update(key, function(prev_value) {
                if (!prev_value) {
                    prev_value = [];
                } else {
                    prev_value = JSON.parse(prev_value);
                }
                var new_value = outer_args.concat(prev_value);
                return [JSON.stringify(new_value), new_value.length];
            }).then(function(value) {
                resolve(value);
            });
        });
    };

    Cursor.prototype.lpushx = function(key) {
        var plugin = this.plugin;
        var outer_args = Array.prototype.slice.call(arguments, 1);
        return new Promise(function(resolve, reject) {
            plugin.update(key, function(prev_value) {
                if (!prev_value) {
                    return [undefined, 0];
                } else {
                    prev_value = JSON.parse(prev_value);
                }
                var new_value = outer_args.concat(prev_value);
                return [JSON.stringify(new_value), new_value.length];
            }).then(function(value) {
                resolve(value);
            });
        });
    };

    Cursor.prototype.rpop = function(key) {
        var plugin = this.plugin;
        return new Promise(function(resolve, reject) {
            plugin.update(key, function(prev_value) {
                if (!prev_value) {
                    prev_value = [];
                } else {
                    prev_value = JSON.parse(prev_value);
                }
                var value = prev_value[prev_value.length-1];
                var new_value = prev_value.slice(0, prev_value.length-1);
                return [JSON.stringify(new_value), value];
            }).then(function(value) {
                resolve(value);
            });
        });
    };
    
    Cursor.prototype.lpop = function(key) {
        var plugin = this.plugin;
        return new Promise(function(resolve, reject) {
            plugin.update(key, function(prev_value) {
                if (!prev_value) {
                    prev_value = [];
                } else {
                    prev_value = JSON.parse(prev_value);
                }
                var value = prev_value[0];
                var new_value = prev_value.slice(1);
                return [JSON.stringify(new_value), value];
            }).then(function(value) {
                resolve(value);
            });
        });
    };

    Cursor.prototype.rpoplpush = function(source, destination) {
        var _this = this;
        var plugin = this.plugin;
        return new Promise(function(resolve, reject) {
            plugin.update(source, function(prev_value) {
                if (!prev_value) {
                    return [undefined, undefined];
                } else {
                    prev_value = JSON.parse(prev_value);
                }
                var value = prev_value[prev_value.length-1];
                var new_value = prev_value.slice(0, prev_value.length-1);
                return [JSON.stringify(new_value), value];
            }).then(function(value) {
                if (value == undefined) {
                    resolve(undefined);
                } else {
                    _this.lpush(destination, value).then(function() {
                        resolve(value);
                    });
                }
            });
        });
    };

    Cursor.prototype.blpop = function() {
        var args = Array.prototype.slice.call(arguments);
        var keys = args.slice(0, args.length-1);
        var timeout = args[args.length-1];
    };

    Cursor.prototype.brpop = function() {
        var args = Array.prototype.slice.call(arguments);
        var keys = args.slice(0, args.length-1);
        var timeout = args[args.length-1];
    };
    
    Cursor.prototype.brpoplpush = function(source, destination timeout) {
    };

    function easy_connect(options) {
        return new Cursor(new LocalStoragePlugin());
    }

    return {
        'Cursor'             : Cursor,
        'LocalStoragePlugin' : LocalStoragePlugin,
        'connect'            : easy_connect
    };
})();
