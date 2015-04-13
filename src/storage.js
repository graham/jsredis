var l = function() {
    console.log( arguments );
}

var Redis = (function() {
    function generateUUID(){
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (d + Math.random()*16)%16 | 0;
            d = Math.floor(d/16);
            return (c=='x' ? r : (r&0x3|0x8)).toString(16);
        });
        return uuid;
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

    var x_in_list = function(x, the_list) {
        var l = the_list.length;
        for(var i = 0; i < l; i += 1) {
            if (x == the_list[i]) {
                return true;
            }
        }
        return false;
    };

    var any_in_list = function(first_list, second_list) {
        for(var i=0; i < first_list.length; i++) {
            var left = first_list[i];
            if (x_in_list(left, second_list)) {
                return true;
            }
        }
        return false;
    };
    
    var remove_x_from_list = function(x, the_list) {
        var new_list = [];
        for(var i = 0; i < the_list.length; i += 1) {
            if (x != the_list[i]) {
                new_list.push(the_list[i]);
            }
        }
        return new_list;
    };

    var Beacon = function() {
        this.obs = {};
        this.to_remove = [];
        this.obs_id = 1;
    };

    Beacon.prototype.next_id = function() {
        this.obs_id += 1;
        return this.obs_id;
    };

    Beacon.prototype.smart_add = function(name, o) {
        if (this.obs[name] == undefined) {
            this.obs[name] = [o];
        } else {
            this.obs[name].push(o);
        }
    };

    Beacon.prototype.on = function(name, cb) {
        var uid = this.next_id();
        this.smart_add(name, [cb, true, uid]);
        return uid;
    };

    Beacon.prototype.once = function(name, cb) {
        var uid = this.next_id();
        this.smart_add(name, [cb, false, uid]);
        return uid;
    };

    Beacon.prototype.fire = function(name) {
        if (this.obs[name] != undefined) {
            var ll = this.obs[name];
            var args = [name].concat(arguments); //slice.call(arguments, 1)
            this.obs[name] = this.publish_event_to_list(ll, args);
        }

        if (this.obs['*'] != undefined) {
            var ll = this.obs['*'];
            var args = [name].concat(arguments); //slice.call(arguments, 1)
            this.obs['*'] = this.publish_event_to_list(ll, args);
        }
    };

    Beacon.prototype.publish_event_to_list = function(ll, args) {
        var new_list = [];
        var now_final = false;
        
        for(var i = 0; i < ll.length; i += 1) {
            if (x_in_list(ll[i][2], this.to_remove)) {
                // pass, either it's not a continue, or it's in the remove list.
                this.to_remove = remove_x_from_list(ll[i][2], to_remove);
            } else {
                now_final = ll[i][0].apply(null, args);
                if (now_final != false) {
                    if (ll[i][1]) {
                        new_list.push(ll[i]);
                    }    
                }
            }
        }
        return new_list;
    };

    Beacon.prototype.reset = function() {
        this.obs = {};
    };

    var remove = function(uid) {
        this.to_remove.push(uid);
    };
    
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

        this.update_beacon = new Beacon();
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
        var _this = this;
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
    
    function easy_connect(options) {
        return new Cursor(new LocalStoragePlugin());
    }

    var Connection = function() {
        this.blocked_reads = [];
        this.command_queue = [];
    };

    Connection.prototype.on_change = function(keys, callback) {
        var uuid = generateUUID();
        var _this = this;
        this.blocked_reads.push([keys, callback]);
        return uuid;
    };

    Connection.prototype.handle_update = function(key) {
        var hit = false;
        var new_blocks = [];
        for(var i=0; i < this.blocked_reads.length; i++) {
            var block = this.blocked_reads[i];
            if (hit == false && x_in_list(key, block[0])) {
                block[1](key);
                hit = true;
            } else {
                new_blocks.push(block);
            }
        }
        this.blocked_reads = new_blocks;
    };
    
    return {
        'Cursor'             : Cursor,
        'LocalStoragePlugin' : LocalStoragePlugin,
        'connect'            : easy_connect,
        'InterruptTimer'     : InterruptTimer,
        'Beacon'             : Beacon,
        'Connection'         : Connection
    };
})();
