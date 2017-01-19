---
title: "Cache"
excerpt: ""
---
Grind’s [Cache provider](https://github.com/grindjs/cache) integrates Grind with [cache-manager](https://www.npmjs.com/package/cache-manager).

You can access cache via `app.cache`.
[block:api-header]
{
  "type": "basic",
  "title": "Usage"
}
[/block]
### Reading from the Cache

To retrieve a value from the cache, call `cache.get(key)`.  It will return a promise that will resolve with the value, or null if it doesn’t exist.
[block:code]
{
  "codes": [
    {
      "code": "app.cache.get(`user-{id}`).then(user => {\n\tif(user) {\n\t\tLog.comment('Loaded cached user', user)\n\t} else {\n\t\t// …retreive from db…\t\n\t}\n})",
      "language": "javascript"
    }
  ]
}
[/block]
### Writing to the Cache

To cache a value in the store, call `cache.set(key, value)`.  It will return a promise that resolves once it’s been stored.
[block:code]
{
  "codes": [
    {
      "code": "app.cache.set(`user-{id}`, user, { ttl: 86400 }).then(() => {\n\tLog.comment('User has been stored')\n})",
      "language": "javascript"
    }
  ]
}
[/block]
The third `{ttl}` parameter is optional, if you don’t pass it, it uses the default value as defined in your config.

### Read or Retreive and Write

Cache also has a convenient `cache.wrap(key, retreiver)` function that will first try to read the key from the cache, and if it’s missing, call the retreiver and store it.
[block:code]
{
  "codes": [
    {
      "code": "app.cache.wrap(`user-{id}`, () => User.findById(id), { ttl: 86400 }).then(user => {\n\tLog.comment('Loaded user', user)\n})",
      "language": "javascript"
    }
  ]
}
[/block]
The third `{ttl}` parameter is optional, if you don’t pass it, it uses the default value as defined in your config.

### Removing from the Cache

To remove a cached value from the store, call `cache.del(key)`.  It will return a promise that resolves once it’s been removed.
[block:code]
{
  "codes": [
    {
      "code": "app.cache.del(`user-{id}`).then(() => {\n\tLog.comment('User has been purged')\n})",
      "language": "javascript"
    }
  ]
}
[/block]

[block:api-header]
{
  "type": "basic",
  "title": "Available Engines"
}
[/block]
By default, only in-memory is supported.  If you wish to persist cache (or share between other instances), you’ll want to install a different engine.

cache-manager supports a variety of engines, including fs, redis and memcache:
[block:code]
{
  "codes": [
    {
      "code": "npm install cache-manager-redis --save\nnpm install cache-manager-mongodb --save\nnpm install cache-manager-mongoose --save\nnpm install cache-manager-fs --save\nnpm install cache-manager-fs-binary --save\nnpm install cache-manager-memcached-store --save",
      "language": "shell"
    }
  ]
}
[/block]

[block:api-header]
{
  "type": "basic",
  "title": "Configuration"
}
[/block]
Your cache config should live in `/config/cache.json`.

Here’s an example of a config file showing support for memory, fs and redis:
[block:code]
{
  "codes": [
    {
      "code": "{\n\n\tdefault: 'memory',\n\n\tstores: {\n\n\t\tmemory: {\n\t\t\tdriver: 'memory',\n\t\t\tmax: 10000,\n\t\t\tttl: 86400\n\t\t},\n\n\t\tfs: {\n\t\t\tdriver: 'fs',\n\t\t\tmax: 1000000000,\n\t\t\tpath: 'storage/cache',\n\t\t\tttl: 86400\n\t\t},\n\n\t\tredis: {\n\t\t\tdriver: 'redis',\n\t\t\thost: 'localhost',\n\t\t\tport: 6379,\n\t\t\tttl: 86400\n\t\t}\n\n\t}\n\n}",
      "language": "json"
    }
  ]
}
[/block]
The `default` key tells the Cache provider which store it configure `app.cache` to use.
[block:api-header]
{
  "type": "basic",
  "title": "Accessing Other Stores"
}
[/block]
If you wish to access the non-default cache store, you can load it via the `Cache` function.
[block:code]
{
  "codes": [
    {
      "code": "import {Cache} from 'grind-cache\n\nconst store = Cache('redis', app)",
      "language": "javascript"
    }
  ]
}
[/block]
## Cache Parameters

### store
The first parameter passed to `Cache()` is the store.  This can either be the name of a store in your `cache.json` config file, or you can pass in a full config object.

### app
The second parameter passed to `Cache()` is the instance of app.  If you pass a config object, the app instance is not required.