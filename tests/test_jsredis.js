var conn = null;

var Next = function() {
    return new Promise(function(resolve, reject) { resolve(); });
}

// from: http://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
function generateUUID(){
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
};

function do_tests(connector_constructor, name) {
    describe("Core Connector Functions: " + name, function() {
        beforeEach(function(done) {
            conn = new jsredis.Cursor( new connector_constructor());
            conn.ready.then(function() {
                done();
            });            
        });

        afterEach(function(done) {
            conn.cmd('flushdb').then(function() {
                setTimeout(done, 2);
            });
        });

        it("get and set; should be able to get and set keys.", function(done) {
            conn.cmd('set', 'test', 'value').then(function() {
                conn.cmd('get', 'test').then(function(value) {
                    expect(value).toEqual('value');
                    done();
                });
            });
        });

        it("exists; check if key exists.", function(done) {
            conn.cmd('exists', 'test').then(function(exists) {
                expect(exists).toEqual(false);
                conn.all([
                    conn.cmd('set', 'test', 'value'),
                    conn.cmd('exists', 'test')
                ]).then(function(values) {
                    expect(values[1]).toEqual(true);
                    done();
                })
            });
        });

        it("del; can delete keys.", function(done) {
            conn.cmd('exists', 'key').then(function(exists) {
                expect(exists).toEqual(false);
                return Next();
            }).then(function() {
                return conn.cmd('set', 'key','value');            
            }).then(function() {
                return conn.cmd('set', 'key');
            }).then(function() {
                return conn.cmd('del', 'key');
            }).then(function() {
                conn.cmd('get', 'key').then(function(value) {
                    expect(value).toEqual(undefined);
                    done();
                });
            });
        });

        
        it("keys; return list of all keys in db.", function(done) {
            conn.all([
                conn.cmd('set', 'key1', 1),
                conn.cmd('set', 'key2', 2),
                conn.cmd('set', 'key3', 3),
                conn.cmd('set', 'key4', 4)
            ]).then(function() {
                return conn.cmd('keys').then(function(values) {
                    expect(values.indexOf('key1')).toBeGreaterThan(-1);
                    expect(values.indexOf('key2')).toBeGreaterThan(-1);
                    expect(values.indexOf('key3')).toBeGreaterThan(-1);
                    expect(values.indexOf('key4')).toBeGreaterThan(-1);
                });
            }).then(function() {
                return conn.cmd('del', 'key2');
            }).then(function() {
                return conn.cmd('keys').then(function(values) {
                    expect(values.indexOf('key1')).toBeGreaterThan(-1);
                    expect(values.indexOf('key2')).toEqual(-1);
                    expect(values.indexOf('key3')).toBeGreaterThan(-1);
                    expect(values.indexOf('key4')).toBeGreaterThan(-1);
                    done();
                });
            });
        });
    });

    describe("High Level Functions: " + name, function() {
        beforeEach(function(done) {
            conn = new jsredis.Cursor( new connector_constructor());
            conn.ready.then(function() {
                done();
            });            
        });

        afterEach(function(done) {
            conn.cmd('flushdb').then(function() {
                setTimeout(done, 2);
            });
        });

        it("get and set; should be able to get and set keys.", function(done) {
            conn.cmd('set', 'test', 'value').then(function() {
                conn.cmd('get', 'test').then(function(value) {
                    expect(value).toEqual('value');
                    done();
                });
            });
        });

    });

    describe("Nice functions not found in redis: " + name, function() {
        beforeEach(function(done) {
            conn = new jsredis.Cursor( new connector_constructor());
            conn.ready.then(function() {
                done();
            });            
        });

        afterEach(function(done) {
            conn.cmd('flushdb').then(function() {
                setTimeout(done, 2);
            });
        });

        it("jget and jset for json objects", function(done) {
            conn.cmd('jset', 'test', [1,2,3]).then(function() {
                conn.cmd('jget', 'test').then(function(value) {
                    expect(value).toEqual([1,2,3]);
                    done();
                });
            });
        });

        it("japply; nice way to atomically apply a function to json objects.", function(done) {
            conn.all([
                conn.cmd('jset', 'test', {'sss':[]}),
                conn.cmd('japply', 'test', function(data) {
                    data['sss'].push(1);
                    return data;
                })                
            ]).then(function() {
                conn.cmd('jget', 'test').then(function(value) {
                    expect(value).toEqual({'sss':[1]});
                    done();
                });
            });
        });
    });

    describe("List Functions: " + name, function() {
        beforeEach(function(done) {
            conn = new jsredis.Cursor( new connector_constructor());
            conn.ready.then(function() {
                done();
            });            
        });

        afterEach(function(done) {
            conn.cmd('flushdb').then(function() {
                setTimeout(done, 2);
            });
        });

        it("lpush and rpush: add to list, at head and tail", function(done) {
            conn.all([
                conn.cmd('rpush', 'key', 'one'),
                conn.cmd('rpush', 'key', 'two'),
                conn.cmd('lpush', 'key', 'zero')
            ]).then(function() {
                conn.cmd('get', 'key').then(function(values) {
                    expect(values).toEqual('!["zero","one","two"]');
                    done();
                });
            });
        });

        it("lpop and rpop: remove from list from head or tail.", function(done) {
            conn.all([
                conn.cmd('rpush', 'key', 'one'),
                conn.cmd('rpush', 'key', 'two'),
                conn.cmd('lpush', 'key', 'zero'),
                conn.cmd('lpop', 'key'),
                conn.cmd('rpop', 'key')
            ]).then(function(values) {
                expect(values[3]).toEqual('zero');
                expect(values[4]).toEqual('two');
                done();
            });
        });

        it("lrange should give you items in a list.", function(done) {
            conn.all([
                conn.cmd('rpush', 'key', 'one'),
                conn.cmd('rpush', 'key', 'two'),
                conn.cmd('lpush', 'key', 'zero'),
            ]).then(function(values) {
                return conn.cmd('lrange', 'key', 0, 10)
            }).then(function(values) {
                expect(values).toEqual(['zero', 'one', 'two']);
                return conn.cmd('lrange', 'key', 0, 1);
            }).then(function(values) {
                expect(values).toEqual(['zero', 'one']);
                done();
            });
        });

        it("llen: give the arity of the list (or zero).", function(done) {
            conn.all([
                conn.cmd('rpush', 'key', 'one'),
                conn.cmd('rpush', 'key', 'two'),
                conn.cmd('lpush', 'key', 'zero'),
            ]).then(function(values) {
                return conn.cmd('llen', 'key');
            }).then(function(values) {
                expect(values).toEqual(3);
                done();
            });
        });

        

    });
}

do_tests(jsredis.Connector_LocalStorage, "Local Storage");
do_tests(jsredis.Connector_IndexStorage, "IndexDB Storage");
