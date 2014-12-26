var conn = new storage.Storage('jsredis-test-suite');

describe("JSRedis Core DB Functions", function() {
    it("Should be ok with multiple calls to init.", function(done) {
        conn.init_db().then(function() {
            done();
        });
    });

    it("Should be able to be cleared and re-initialized easily.", function(done) {
        conn.reset_all_data().then(function() {
            conn.init_db().then(function() {
                done();
            });
        });            
    });
});

describe("JSRedis String Functions", function() {
    beforeEach(function(done) {
        conn.reset_all_data().then(function() {
            conn.init_db().then(function() {
                done();
            });
        });            
    });

    it("get/set should work.", function(done) {
        conn.set('test', 'aweso').then(function(data) {
            expect(data.value).toEqual('aweso');
            done();
        });
    });

    it("should get multiple values, even if they don't exist.", function(done) {
        conn.set('one', 111);
        conn.set('two', '222');
        conn.mget('one', 'two').then(function(data) {
            expect(data[0].value).toEqual(111);
            expect(data[1].value).toEqual('222');
            done();
        });
    });

    it("should not be able to get a value that doesn't exist", function(done) {
        conn.get('asdfasdf').then(function(data) {
            expect(data).toEqual(undefined);
            done();
        });
    });

    it("should support mset", function(done) {
        conn.mset('one', 1, 'two', 2).then(function(data) {
            done();
        });
    })
        
});
