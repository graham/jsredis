var TIMEOUT = 0;
    
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

var Beacon = (function() {
    var x_in_list = function(x, the_list) {
        var l = the_list.length;
        for(var i = 0; i < l; i += 1) {
            if (x == the_list[i]) {
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

    return Beacon;
})();


