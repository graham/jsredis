var conn = null;

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

describe("Simple Index Functions", function() {
    beforeEach(function(done) {
        conn = Redis.connect();
        conn.ready.then(function() {
            done();
        });            
    });

    afterEach(function(done) {
        conn.cmd('flushdb').then(function() {
            setTimeout(done, 100);
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
        conn.exists('test').then(function(exists) {
            expect(exists).toEqual(false);
            return Next().resolve();
        }).then(function() {
            conn.all([
                conn.set('test', 'value'),
                conn.exists('test')
            ]).then(function(values) {
                expect(values[1]).toEqual(true);
                done();
            })
        });
    });

    it("del; can delete keys.", function(done) {
        conn.exists('key').then(function(exists) {
            expect(exists).toEqual(false);
            return Next().resolve();
        }).then(function() {
            return conn.set('key','value');            
        }).then(function() {
            return conn.get('key')
        }).then(function() {
            return conn.del('key');
        }).then(function() {
            conn.get('key').then(function(value) {
                expect(value).toEqual(undefined);
                done();
            });
        });
    });

    it("keys; return list of all keys in db.", function(done) {
        conn.all([
            conn.set('key1', 1),
            conn.set('key2', 2),
            conn.set('key3', 3),
            conn.set('key4', 4)
        ]).then(function() {
            return conn.keys().then(function(values) {
                expect(values.indexOf('key1')).toBeGreaterThan(-1);
                expect(values.indexOf('key2')).toBeGreaterThan(-1);
                expect(values.indexOf('key3')).toBeGreaterThan(-1);
                expect(values.indexOf('key4')).toBeGreaterThan(-1);
            });
        }).then(function() {
            return conn.del('key2');
        }).then(function() {
            return conn.keys().then(function(values) {
                expect(values.indexOf('key1')).toBeGreaterThan(-1);
                expect(values.indexOf('key2')).toEqual(-1);
                expect(values.indexOf('key3')).toBeGreaterThan(-1);
                expect(values.indexOf('key4')).toBeGreaterThan(-1);
                done();
            });
        });
    });
});

describe("JSRedis String Functions", function() {
    beforeEach(function(done) {
        conn = Redis.connect();
        conn.ready.then(function() {
            done();
        });            
    });

    afterEach(function(done) {
        conn.cmd('flushdb').then(function() {
            done();
        });
    });

    it("get and set; get and set keys.", function(done) {
        conn.cmd('set', 'test', 'aweso').then(function(data) {
            expect(data).toEqual('aweso');
            done();
        });
    });

    it("lpush and rpush; append and prepend to a list.", function(done) {
        conn.cmd('exists', 'mylist').then(function(result) {
            expect(result).toEqual(false);

            Promise.all([
                conn.rpush('mylist', 0),
                conn.rpush('mylist', 5),
                conn.lpush('mylist', 8)
            ]).then(function(values) {
                conn.get('mylist').then(function(value) {
                    expect(JSON.parse(value)).toEqual([8,0,5]);
                    done();
                });
            });
        });
    });

    it("lpop and rpop; pop off both sides of a list.", function(done) {
        Promise.all([
            conn.rpush('mylist', 1),
            conn.rpush('mylist', 2),
            conn.rpush('mylist', 3),
            conn.lpush('mylist', 0)
        ]).then(function() {
            conn.lpop('mylist').then(function(value) {
                expect(value).toEqual(0);

                Promise.all([
                    conn.lpop('mylist'),
                    conn.lpop('mylist'),
                    conn.rpush('mylist', 4),
                    conn.lpop('mylist'),
                    conn.lpop('mylist')               
                ]).then(function(values) {
                    // this is a little hard to read,
                    // the first two are the values,
                    // the second '2' is the len of the list when
                    // 4 is appended [3,4].
                    // [3,4] are the last 2 values.
                    expect(values).toEqual([1,2,2,3,4]);
                    return Next().resolve();
                }).then(function() {
                    return conn.all([
                        conn.rpush('mylist', 'a'),
                        conn.rpush('mylist', 'b'),
                        conn.lpush('mylist', 'A')
                    ]);
                }).then(function() {
                    conn.rpop('mylist').then(function(value) {
                        expect(value).toEqual('b');
                        done();
                    });
                });
            });
        });
    });

    it("should support lindex correctly (including negative)", function(done) {
        conn.all([
            conn.rpush('mylist', 1),
            conn.rpush('mylist', 2),
            conn.rpush('mylist', 3)
        ]).then(function() {
            conn.all([
                conn.lindex('mylist', 2),
                conn.lindex('mylist', 0),
                conn.lindex('mylist', -1)
            ]).then(function(values) {
                expect(values).toEqual([3,1,3]);
                done();
            });
        });
    });

    it("lrem all.", function(done) {
        conn.all([
            conn.rpush('mylist', 1),
            conn.rpush('mylist', 2),
            conn.rpush('mylist', 3),
            conn.rpush('mylist', 1),
            conn.rpush('mylist', 1)
        ]).then(function() {
            var n = Next();

            conn.lrem('mylist', 0, 1).then(function() {
                n.resolve();
            });

            return n;
        }).then(function() {
            conn.get('mylist').then(function(value) {
                expect(value).toEqual('[2,3]');
                done();
            });
        });
    });

    it("lrem some.", function(done) {
        conn.all([
            conn.rpush('mylist', 'hello'),
            conn.rpush('mylist', 'world'),
            conn.rpush('mylist', 'hello'),            
            conn.rpush('mylist', 'good'),
            conn.rpush('mylist', 'hello'),
            conn.rpush('mylist', 'hello')
        ]).then(function() {
            var n = Next();

            conn.lrem('mylist', 1, 'hello').then(function() {
                n.resolve();
            });

            return n;
        }).then(function() {
            var n = Next();
            
            conn.get('mylist').then(function(value) {
                expect(value).toEqual('["world","hello","good","hello","hello"]');
                n.resolve();
            });

            return n;
        }).then(function() {
            var n = Next();

            conn.lrem('mylist', -1, 'hello').then(function() {
                conn.get('mylist').then(function(value) {
                    expect(value).toEqual('["world","hello","good","hello"]');
                    n.resolve();
                });
            });
            
            return n;
        }).then(function() {
            done();
        });
    });

    it("setnx; like set, but fails if key already exists.", function(done) {
        conn.setnx('key', 'value').then(function(value) {
            expect(value).toEqual(1);
            return conn.get('key');
        }).then(function(value) {
            expect(value).toEqual('value');
            return conn.all([
                conn.setnx('key', 'newvalue'),
                conn.get('key')
            ]);
        }).then(function(values) {
            expect(values[0]).toEqual(0);
            expect(values[1]).toEqual('value');
            done();
        });
    });

    it("llen; returns the length of a list.", function(done) {
        conn.all([
            conn.rpush('key', 1),
            conn.rpush('key', 2),
            conn.rpush('key', 3)
        ]).then(function(results) {
            return conn.llen('key');
        }).then(function(length) {
            expect(length).toEqual(3);
            done();
        });
    });

    it("lrange; gets a slice of a list.", function(done) {
        conn.all([
            conn.rpush('key', 1),
            conn.rpush('key', 2),
            conn.rpush('key', 3)
        ]).then(function(results) {
            return conn.all([
                conn.lrange('key', 0, -1),
                conn.lrange('key', 0, 2),
                conn.lrange('key', 0, 1),
                conn.lrange('key', 0, 0)
            ]);
        }).then(function(results) {
            expect(results).toEqual([[1,2,3], [1,2,3], [1,2], [1]]);
            done();
        });
    });

    it("lset; set an item within a list.", function(done) {
        conn.all([
            conn.rpush('key', 1),
            conn.rpush('key', 2),
            conn.rpush('key', 3)
        ]).then(function(results) {
            return conn.all([
                conn.lset('key', 0, 'testing'),
                conn.lrange('key', 0, -1)
            ]);
        }).then(function(results) {
            expect(results[1]).toEqual(['testing', 2, 3]);
            done();
        });
    });
});
