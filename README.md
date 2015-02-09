JSRedis
=======

Redis is great, I've been a huge fan of it for years, it provides a ton of really great was to interact with data. In many cases it can even provide concurrency primitives in places where they can otherwise be hard to implement (and running redis is usually way easier than ZeroMQ or RabbitMQ).

So why clone it in Javascript? Well, I often find that as an application grows, keeping track of the data you have gets more difficult, wouldn't it be nice if we could use the primitives provided to us by Redis in the browser?

I like Redis, I like the commands, I thinks it's pretty easy to map large amounts of data and more complex data flow onto the features it provides, and that's exactly what JSRedis is built to do.

Internally it will likely change over time, and won't be nearly as optimized ( http://redis.io/topics/memory-optimization ) but it should provide you with the functionality.

Task list, only completed if there is a test that passes :)

Simple stuff for any KVS:

   - [x] get
   - [x] set
   - [x] reset db
   - [x] exists
   - [x] keys
   - [x] batch commands
   - [x] del
   - [ ] transactions
   - [ ] db lock (for multiple tabs).

Plugins:

   - [x] localStorge / sessionStorage
   - [ ] IndexedDB

## Redis Commands:

All Keys:

   - [ ] expire
   - [ ] presist
   - [x] rename
   - [x] renamenx
   - [ ] type

Lists:

   - [ ] blpop
   - [ ] brpop
   - [ ] brpoplpush
   - [x] lindex
   - [x] linsert
   - [x] llen
   - [x] lpop
   - [x] lpush
   - [x] lpushx
   - [x] lrange
   - [ ] lrem
   - [x] lset
   - [x] ltrim
   - [x] rpop
   - [x] rpoplpush
   - [x] rpush
   - [x] rpushx

Strings:

   - [x] append
   - [x] decr
   - [x] decrby
   - [x] get
   - [x] getrange
   - [ ] getset
   - [x] incr
   - [x] incrby
   - [ ] incrbyfloat
   - [x] mget
   - [x] mset
   - [x] msetnx
   - [ ] psetex
   - [x] set
   - [ ] setex
   - [x] setnx
   - [ ] setrange
   - [x] strlen

Bit Ops (harder to do in js):

   - [ ] bitcount
   - [ ] bitop
   - [ ] bitpos
   - [ ] getbit
   - [ ] setbit

Sets:

   - [ ] sadd
   - [ ] scard
   - [ ] sdiff
   - [ ] sdiffstore
   - [ ] sinter
   - [ ] sinterstore
   - [ ] sismember
   - [ ] smembers
   - [ ] smove
   - [ ] spop
   - [ ] srandmember
   - [ ] srem
   - [ ] sunion
   - [ ] sunionstore
   - [ ] sscan

Hashes:

   - [ ] hdel
   - [ ] hexists
   - [ ] hget
   - [ ] hgetall
   - [ ] hincrby
   - [ ] hincrbyfloat
   - [ ] hkeys
   - [ ] hlen
   - [ ] hmget
   - [ ] hmset
   - [ ] hset
   - [ ] hsetnx
   - [ ] hvals
   - [ ] hscan

Sorted Sets:

   - [ ] zadd
   - [ ] zcard
   - [ ] zcount
   - [ ] zincrby
   - [ ] zinterstore
   - [ ] zlexcount
   - [ ] zrange
   - [ ] zrangebylex
   - [ ] zrevrangebylex
   - [ ] zrangebyscore
   - [ ] zrank
   - [ ] zrem
   - [ ] zremrangebylex
   - [ ] zremrangebyrank
   - [ ] zremrangebyscore
   - [ ] zrevrange
   - [ ] zrevrangebyscore
   - [ ] zrevrank
   - [ ] zscore
   - [ ] zunionstore
   - [ ] zscan

HyperLogLog, Pub/Sub, Transactions, and Scripting will be implemented once I implement more of the things above.