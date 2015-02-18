/*
Copyright [2014] [Graham Abbott <graham.abbott@gmail.com>]

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

var Next = function() {
    return new PromiseValue();
};

var BufferedRead = function() {
    
};
