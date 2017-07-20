# Support Helpers

Grind comes packaged with `grind-support` which is a collection of helpers you can use within your app.

As `grind-support` comes with `grind-framework`, there’s no need to explicitly add it to your `package.json` file.

[[toc]]

## FS

`FS` includes a fully promised based implementation of [Node’s fs](https://nodejs.org/api/fs.html) module.  On Node 8+ Platforms, `FS` takes advantage Node’s `promisify` utility while falling back to a manual implementation on older platforms.

In additional to the standard methods provided by `fs`, the `FS` class includes the following additional functionality:

### mkdirp

A promise based implementation of [mkdirp](https://www.npmjs.com/package/mkdirp).

---

### mkdirs

Alias of `mkdirp`.

---

### touch

The `touch` method allows you to update the timestamp of a file.

```js
touch(pathname, time = Date.now())
```

###### Parameters
* `pathname` — The path to touch
* `time` — Optionally specify a time to set, defaulting to the current time.

---

### recursiveReaddir

A promise based implementation of [recursive-readdir](https://www.npmjs.com/package/recursive-readdir).

## Inflect

Inflect provides an instance of the [i](https://www.npmjs.com/package/i) package.

## merge

The `merge` function recursively merges objects & arrays, returning a new object:

```js
merge(lhs, rhs)
```

###### Parameters
* `lhs` — The object or array to merge into
* `rhs` — The object or array to merge from, any values in both `lhs` and `rhs` will be overwritten by `rhs`.

##### Example

```js
const merged = merge({
	bool: true,
	nested: {
		a: 'a',
		b: 'b',
		c: {
			value: true
		}
	},
	array: [ 'a', 'b' ]
}, {
	bool: false,
	nested: {
		c: {
			value: false
		}
	},
	array: [ 'c' ]
})
```

The `merged` variable will now be the following object:

```json
{
	"bool": false,
	"nested": {
		"a": "a",
		"b": "b",
		"c": {
			"value": false
		}
	},
	"array": [ "a", "b", "c" ]
}
```


## Obj

### get

`get` allows you to get values from nested object by using a key path.

```js
get(object, keyPath, fallback)
```

###### Parameters
* `object` — Target object to query
* `keyPath` — The key path to find the value for
* `fallback` — Optional value to fallback to if the key path doesn’t exist.

###### Example

```js
Obj.get({
	app: {
		debug: true
	}
}, "app.debug") // True
```

---

### has

`has` allows you to check if a value exists within a nested object by using a key path.

```js
has(object, keyPath)
```

###### Parameters
* `object` — Target object to check
* `keyPath` — The key path to see if there’s a value for

###### Example

```js
Obj.has({
	app: {
		debug: true
	}
}, "app.debug") // True

Obj.has({
	app: {
		debug: true
	}
}, "app.port") // false
```

---

### set

`has` allows you to set a value within a nested object by using a key path.

```js
set(object, keyPath, value)
```

###### Parameters
* `object` — Target object to update
* `keyPath` — The key path to set a value on
* `value` — The value to set

###### Example

```js
Obj.set({
	app: {
		debug: true
	}
}, "app.debug", false)
```

---

### filter

`filter` allows you to filter an object by key or value.

```js
filter(object, filter)
```

###### Parameters
* `object` — Target object to filter
* `filter` — A callback function used to test if a key/value should be included.

###### Example

```js
Obj.filter({
	a: false,
	b: true,
	c: false
}, (key, value) => {
	return key === 'a' || value === true
}) // Results in `{ a: false, b: true }` with `c` being filtered out
```

---

### only

`only` allows you to return an object containing only the whitelisted keys

```js
only(object, keys)
```

###### Parameters
* `object` — Target object to filter
* `keys` — An array or set of keys to allow

###### Example

```js
Obj.only({
	a: false,
	b: true,
	c: false
}, [ 'a', 'c' ]) // Results in `{ a: false, c: false }` with `b` being excluded
```

---

### except

`except` is the opposite of `only` and allows you to return an object excluding any blacklisted keys

```js
except(object, keys)
```

###### Parameters
* `object` — Target object to filter
* `keys` — An array or set of keys to ignore

###### Example

```js
Obj.only({
	a: false,
	b: true,
	c: false
}, [ 'a' ]) // Results in `{ b: true, c: false }` with `a` being excluded
```

## Str

### ascii

`ascii` will convert a string of unicode characters and attempt to convert them to ascii characters and otherwise stripping them if it’s unable to do so.

```js
ascii(str, { charmap = null, lower = false } = { })
```

###### Parameters
* `str` — Target str
* `options.charmap` — Override the default charmap to change how `ascii` converts characters
* `options.lower` — Convert all characters to lowercase if true

###### Examples

```js
Str.ascii('Gríñd Fråmêwörk') // `Grind Framework`
Str.ascii('© 2017') // `c 2017`
Str.ascii('25€') // `25euro`
Str.ascii('Emoji 🚀') // `Emoji`
```

---

### slug

`slug` will first call `Str.ascii` to convert any non-ascii characters to their ascii counterparts, strip any non-alphanumberic characters and finally replace any whitespace with a dash.

```js
slug(str, { charmap = null, separator = '-', lower = true } = { })
```

###### Parameters
* `str` — Target str
* `options.charmap` — Override the default charmap to change how `ascii` converts characters
* `options.separator` — Override the default separator used to replace whitespace
* `options.lower` — Convert all characters to lowercase if true

###### Examples

```js
Str.ascii('Gríñd Fråmêwörk') // `grind-framework`
Str.ascii('Gríñd Fråmêwörk', { separator: '_' }) // `grind_framework`
```

## Usage

You can use any of the aforementioned helpers by importing them from the `grind-support` package:

```js
import { Str } from 'grind-support'

Log.info('Slug', Str.slug('Grind Framework')) // Outputs grind-framework
```

> {tip} `grind-support` is not directly dependent on Grind, so you can safely use it in non-Grind based projects.
