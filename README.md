JSRedis
=======

Redis is great, I've been a huge fan of it for years, it provides a ton of really great was to interact with data. In many cases it can even provide concurrency primitives in places where they can otherwise be hard to implement (and running redis is usually way easier than ZeroMQ or RabbitMQ).

So why clone it in Javascript? Well, I often find that as an application grows, keeping track of the data you have gets more difficult, wouldn't it be nice if we could use the primitives provided to us by Redis in the browser?

WebSQL would have been great, but unfortunately that's been killed ( http://stackoverflow.com/questions/4720592/what-is-the-status-of-html5-database ), and for now it appears IndexDB is gaining traction.

I like Redis, I like the commands, I thinks it's pretty easy to map large amounts of data and more complex data flow onto the features it provides, and that's exactly what JSRedis is built to do.

Internally it will likely change over time, and won't be nearly as optimized ( http://redis.io/topics/memory-optimization ) but it should provide you with the functionality.

Task list, only completed if there is a test that passes :)

Simple KV Interface for IndexedDB:

   - [x] get
   - [x] set
   - [x] reset db
   - [x] exists
   - [x] keys
   - [x] batch commands
   - [x] del
   - [ ] transactions
   - [ ] db lock (for multiple tabs).

Redis Commands:

All Keys:

   - [ ] expire
   - [ ] presist
   - [ ] rename
   - [ ] type
   - [ ] renamenx

Lists:

   - [ ] blpop
   - [ ] brpop
   - [ ] brpoplpush
   - [x] lindex
   - [ ] linsert
   - [ ] llen
   - [ ] lpop
   - [x] lpush
   - [ ] lpushx
   - [ ] lrange
   - [-] lrem
   - [ ] lset
   - [ ] ltrim
   - [ ] rpop
   - [ ] rpoplpush
   - [x] rpush
   - [ ] rpushx

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

Strings:

   - [ ] append
   - [ ] bitcount
   - [ ] bitop
   - [ ] bitpos
   - [ ] decr
   - [ ] decrby
   - [x] get
   - [ ] getbit
   - [ ] getrange
   - [ ] getset
   - [ ] incr
   - [ ] incrby
   - [ ] incrbyfloat
   - [ ] mget
   - [ ] mset
   - [ ] msetnx
   - [ ] psetex
   - [x] set
   - [ ] setbit
   - [ ] setex
   - [ ] setnx
   - [ ] setrange
   - [ ] strlen

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

SortedSets, HyperLogLog, Pub/Sub, Transactions, Scripting, Server: Soon. :)