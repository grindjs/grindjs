# Cache
Grind’s [Cache provider](https://github.com/grindjs/cache) integrates Grind with [cache-manager](https://www.npmjs.com/package/cache-manager).

You can access cache via `app.cache`.

## Usage
### Reading from the Cache
To retrieve a value from the cache, call `cache.get(key)`.  It will return a promise that will resolve with the value, or null if it doesn’t exist.

```js
app.cache.get(`user-{id}`).then(user => {
	if(user) {
		Log.comment('Loaded cached user', user)
	} else {
		// …retreive from db…
	}
})
```

### Writing to the Cache
To cache a value in the store, call `cache.set(key, value)`.  It will return a promise that resolves once it’s been stored.

```js
app.cache.set(`user-{id}`, user, { ttl: 86400 }).then(() => {
	Log.comment('User has been stored')
})
```

The third `{ttl}` parameter is optional, if you don’t pass it, it uses the default value as defined in your config.

### Read or Retreive and Write
Cache also has a convenient `cache.wrap(key, retreiver)` function that will first try to read the key from the cache, and if it’s missing, call the retreiver and store it.

```js
app.cache.wrap(`user-{id}`, () => User.findById(id), { ttl: 86400 }).then(user => {
	Log.comment('Loaded user', user)
})
```

The third `{ttl}` parameter is optional, if you don’t pass it, it uses the default value as defined in your config.

### Removing from the Cache
To remove a cached value from the store, call `cache.del(key)`.  It will return a promise that resolves once it’s been removed.

```js
app.cache.del(`user-{id}`).then(() => {
	Log.comment('User has been purged')
})
```

## Available Engines
By default, only in-memory is supported.  If you wish to persist cache (or share between other instances), you’ll want to install a different engine.

cache-manager supports a variety of engines, including fs, redis and memcache:
```shell
npm install cache-manager-redis --save
npm install cache-manager-mongodb --save
npm install cache-manager-mongoose --save
npm install cache-manager-fs --save
npm install cache-manager-fs-binary --save
npm install cache-manager-memcached-store --save
```

## Configuration
Your cache config should live in `/config/cache.json`.

Here’s an example of a config file showing support for memory, fs and redis:
```json
{

	"default": "memory",

	"stores": {

		"memory": {
			"driver": "memory",
			"max": 10000,
			"ttl": 86400
		},

		"fs": {
			"driver": "fs",
			"max": 1000000000,
			"path": "storage/cache",
			"ttl": 86400
		},

		"redis": {
			"driver": "redis",
			"host": "localhost",
			"port": 6379,
			"ttl": 86400
		}

	}

}
```

The `default` key tells the Cache provider which store it configure `app.cache` to use.

## Accessing Other Stores
If you wish to access the non-default cache store, you can load it via the `Cache` function.

```js
import { Cache } from 'grind-cache'

const store = Cache('redis', app)
```

### Cache Parameters
#### store
The first parameter passed to `Cache()` is the store.  This can either be the name of a store in your `cache.json` config file, or you can pass in a full config object.

#### app
The second parameter passed to `Cache()` is the instance of app.  If you pass a config object, the app instance is not required.
