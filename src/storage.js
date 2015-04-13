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

