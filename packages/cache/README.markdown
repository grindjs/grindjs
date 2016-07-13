# grind-cache

`grind-cache` is a thin wrapper around [node-cache-manager](https://github.com/BryanDonovan/node-cache-manager/) for simple integration with [Grind](https://github.com/grindjs/framework).

## Installation

Add `grind-cache` to your project:

```bash
npm install grind-cache --save
```

Next, if needed, you should the cache engine(s) you need.  node-cache-manager [supports](https://github.com/BryanDonovan/node-cache-manager#store-engines) a variety of different engines:

```bash
npm install cache-manager-redis --save
npm install cache-manager-mongodb --save
npm install cache-manager-mongoose --save
npm install cache-manager-fs --save
npm install cache-manager-fs-binary --save
npm install cache-manager-memcached-store --save
```

## Usage

To use `grind-cache` you’ll need to add it to your `Grind` providers:

```js
import Grind from 'grind-framework'
import {CacheProvider} from 'grind-cache'

const app = new Grind()
app.providers.push(CacheProvider)
```

From there, you can access the store via `app.get('cache')`.

## Config

`grind-cache` creates it’s node-cache-manager instance by leveraging `Grind`’s config system. Here’s a quick example using Redis:

```json
{
	"default": "redis",
	"connections": {
		"redis": {
			"driver": "redis",
			"host": "localhost",
			"port": 6379,
			"ttl": 86400
		}
	}
}
```

You should place this in `config/cache.json` in your Grind project.
