var conn = null;

describe("Simple Index Functions", function() {
    beforeEach(function(done) {
        if (conn) {
            conn.close();
        }
        conn = new SimpleIndex('simple-index-test-suite');
        conn.reset_all_data().then(function() {
            conn.init_db().then(function() {
                conn.ready.then(function() {
                    done();
                });
            });
        });            
    });

    it("get and set; should be able to get and set keys.", function(done) {
        conn.set('test', 'value').then(function() {
            conn.get('test').then(function(value) {
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
        if (conn) {
            conn.close();
        }
        conn = new SimpleRedis('redis-index-test-suite');
        conn.reset_all_data().then(function() {
            conn.init_db().then(function() {
                conn.ready.then(function() {
                    done();
                });
            });
        });
    });

    it("get and set; get and set keys.", function(done) {
        conn.set('test', 'aweso').then(function(data) {
            expect(data).toEqual('aweso');
            done();
        });
    });

    it("lpush and rpush; append and prepend to a list.", function(done) {
        conn.exists('mylist').then(function(result) {
            expect(result).toEqual(false);

            Promise.all([
                conn.cmd('rpush', 'mylist', 0),
                conn.cmd('rpush', 'mylist', 5),
                conn.cmd('lpush', 'mylist', 8)
            ]).then(function(values) {
                conn.cmd('get', 'mylist').then(function(value) {
                    expect(JSON.parse(value)).toEqual([8,0,5]);
                    done();
                });
            });
        });
    });

    it("lpop and rpop; pop off both sides of a list.", function(done) {
        Promise.all([
            conn.cmd('rpush', 'mylist', 1),
            conn.cmd('rpush', 'mylist', 2),
            conn.cmd('rpush', 'mylist', 3),
            conn.cmd('lpush', 'mylist', 0)
        ]).then(function() {
            conn.cmd('lpop', 'mylist').then(function(value) {
                expect(value).toEqual(0);

                Promise.all([
                    conn.cmd('lpop', 'mylist'),
                    conn.cmd('lpop', 'mylist'),
                    conn.cmd('rpush', 'mylist', 4),
                    conn.cmd('lpop', 'mylist'),
                    conn.cmd('lpop', 'mylist')               
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
                        conn.cmd('rpush', 'mylist', 'a'),
                        conn.cmd('rpush', 'mylist', 'b'),
                        conn.cmd('lpush', 'mylist', 'A')
                    ]);
                }).then(function() {
                    conn.cmd('rpop', 'mylist').then(function(value) {
                        expect(value).toEqual('b');
                        done();
                    });
                });
            });
        });
    });

    it("should support lindex correctly (including negative)", function(done) {
        conn.all([
            conn.cmd('rpush', 'mylist', 1),
            conn.cmd('rpush', 'mylist', 2),
            conn.cmd('rpush', 'mylist', 3)
        ]).then(function() {
            conn.all([
                conn.cmd('lindex', 'mylist', 2),
                conn.cmd('lindex', 'mylist', 0),
                conn.cmd('lindex', 'mylist', -1)
            ]).then(function(values) {
                expect(values).toEqual([3,1,3]);
                done();
            });
        });
    });

    it("lrem all.", function(done) {
        conn.all([
            conn.cmd('rpush', 'mylist', 1),
            conn.cmd('rpush', 'mylist', 2),
            conn.cmd('rpush', 'mylist', 3),
            conn.cmd('rpush', 'mylist', 1),
            conn.cmd('rpush', 'mylist', 1)
        ]).then(function() {
            var n = Next();

            conn.cmd('lrem', 'mylist', 0, 1).then(function() {
                n.resolve();
            });

            return n;
        }).then(function() {
            conn.cmd('get', 'mylist').then(function(value) {
                expect(value).toEqual('[2,3]');
                done();
            });
        });
    });

    it("lrem some.", function(done) {
        conn.all([
            conn.cmd('rpush', 'mylist', 'hello'),
            conn.cmd('rpush', 'mylist', 'world'),
            conn.cmd('rpush', 'mylist', 'hello'),            
            conn.cmd('rpush', 'mylist', 'good'),
            conn.cmd('rpush', 'mylist', 'hello'),
            conn.cmd('rpush', 'mylist', 'hello')
        ]).then(function() {
            var n = Next();

            conn.cmd('lrem', 'mylist', 1, 'hello').then(function() {
                n.resolve();
            });

            return n;
        }).then(function() {
            var n = Next();
            
            conn.cmd('get', 'mylist').then(function(value) {
                expect(value).toEqual('["world","hello","good","hello","hello"]');
                n.resolve();
            });

            return n;
        }).then(function() {
            var n = Next();

            conn.cmd('lrem', 'mylist', -1, 'hello').then(function() {
                conn.cmd('get', 'mylist').then(function(value) {
                    expect(value).toEqual('["world","hello","good","hello"]');
                    n.resolve();
                });
            });
            
            return n;
        }).then(function() {
            done();
        });
    });

});

describe("InterruptTimer tests", function() {
    it("timeouts should work.", function(done) {
        var did_fire = null;
        var did_timeout = null;

        var do_fire = function(value) {
            if (value == undefined) {
                did_timeout = true;
            } else {
                did_fire = true;
            }
        }
        
        var one = new InterruptTimer(do_fire, 1);
        one.start();
        
        setTimeout(function() {
            expect(did_timeout).toEqual(true);
            done();
        }, 100);
    });

    it("Make sure value calls correctly if the fire method is called.", function(done) {
        var did_fire = null;
        var did_timeout = null;
        var do_fire = function(value) {
            if (value == undefined) {
                did_timeout = true;
            } else {
                did_fire = true;
            }
        }
        
        var one = new InterruptTimer(do_fire, 100);
        one.start();

        setTimeout(function() {
            one.fire('boom');
        }, 10);
        
        setTimeout(function() {
            expect(did_fire).toEqual(true);
            done();
        }, 50);
    });

    it("ensure only one method gets called.", function(done) {
        var did_fire = null;
        var did_timeout = null;
        var do_fire = function(value) {
            if (value == undefined) {
                did_timeout = true;
            } else {
                did_fire = true;
            }
        }
        
        var one = new InterruptTimer(do_fire, 10);
        one.start();
        one.fire('asdf');
        one.cancel();

        expect(did_fire).toEqual(true);
        expect(did_timeout).toEqual(null);
        done();
    });

});
