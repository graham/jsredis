var conn = null;

describe("Simple Index Functions", function() {
    beforeEach(function(done) {
        if (conn) {
            conn.close();
        }

        conn = new SimpleIndex('simple-index-test-suite');
        conn.reset_all_data().then(function() {
            conn.init_db().then(function() {
                done();
            });
        });
    });

    it("should have get/set methods that work.", function(done) {
        conn.set('test', 'value').then(function() {
            conn.get('test').then(function(value) {
                expect(value).toEqual('value');
                done();
            })
        });
    });
});

describe("JSRedis String Functions", function() {
    beforeEach(function(done) {
        if (conn) {
            conn.close();
        }

        conn = new SimpleRedis('js-redis-test-suite');
        conn.reset_all_data().then(function() {
            conn.init_db().then(function() {
                done();
            });
        });
    });

    it("get/set should work.", function(done) {
        conn.set('test', 'aweso').then(function(data) {
            expect(data).toEqual('aweso');
            done();
        });
    });

    it("should get multiple values, even if they don't exist.", function(done) {
        conn.set('one', 111);
        conn.set('two', '222');
        conn.get('two').then(function(data) {
            expect(data).toEqual('222');
            done();
        });
    });
});
