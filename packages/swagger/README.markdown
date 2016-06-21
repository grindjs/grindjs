# grind-swagger

`grind-swagger` is a swagger provider for `Grind`.  It’ll create `/swagger.json` endpoint on your API and expose any documented* routes.

## Installation

Add `grind-swagger` to your project:

```bash
npm install grind-swagger --save
```

## Usage

To use `grind-swagger` you’ll need to add it to your `Grind` providers:

```js
import Grind from 'grind-framework'

const app = new Grind()
app.providers.push(require('grind-swagger').provider)
```

## Documenting routes

`grind-swagger` will only expose routes that are explicitly documented for swagger.

You can document your routes for swagger by passing in a third param when registering:

```js
app.routes.get('/states', 'index', {
	swagger: {
		description: 'Gets a list of states',
		parameters: [
			{
				name: 'limit',
				in: 'query',
				required: false,
				description: 'Limit the number of records',
				type: 'integer'
			}, {
				name: 'offset',
				in: 'query',
				required: false,
				description: 'Skip records before querying',
				type: 'integer'
			}
		]
	}
})
```

## Inferred route documentation

The previous example uses the Swagger spec directly, however `grind-swagger` can infer quite a bit for you for you:

```js
app.routes.get('/:state/cities/:letter?', 'index', {
	swagger: {
		description: 'Gets a list of cities in a state',
		parameters: {
			state: 'State abbreviation',
			letter: 'Letter to filter cities by'
			limit: {
				description: 'Limit the number of records',
				type: 'integer'
			},
			offset: {
				description: 'Skip records before querying',
				type: 'integer'
			}
		}
	}
})
```

Based on this, the following can be inferred:

* `state` is a required string parameter that appears in the URL
* `letter` is an optional string parameter that may appear in the URL
* `limit` and `offset` are optional query string parameters

How this works:

* `letter` is inferred as optional due to the route param’s trailing `?`.  `state` is a non-optional parameter, making it required.
* If no type is provided, all parameters default to a `string` type unless they end with `_id`, which defaults to `integer`
* `limit` and `offset` are inferred as _optional_ query parameters because they don’t appear in the route path and this is a `GET` request.
* For non-`GET` requests, parameters that don’t appear in the route path are inferred as _required_ `body` parameters.
* All rules that are explicitly defined will take precedence over any inferred rules.

## Shared parameters

No one wants to clutter their code with a bunch of repetitive documentation.  To avoid this, you can define shared parameters (and groups of parameters) to use within your routes:

```js
import Swagger from 'grind-swagger'

// Register a single parameter
Swagger.parameter('state', {
	name: 'state',
	in: 'url',
	required: true,
	description: 'State abbreviation',
	type: 'string'
})

// Register a group of parameters
Swagger.parameters('pagination', [
	{
		name: 'limit',
		in: 'query',
		required: false,
		description: 'Limit the number of records',
		type: 'integer'
	}, {
		name: 'offset',
		in: 'query',
		required: false,
		description: 'Skip records before querying',
		type: 'integer'
	}
])

// Now you can reuse these quickly:
app.routes.get('/:state/cities/:letter?', 'index', {
	swagger: {
		description: 'Gets a list of cities in a state',
		use: [ 'state', 'pagination' ]
	}
})
```

Shared parameters can also take advantage of inference, allowing for far more concise and readable code:

```js
import Swagger from 'grind-swagger'

Swagger.parameter('state', 'State abbreviation')
Swagger.parameters('pagination', {
	limit: {
		description: 'Limit the number of records',
		type: 'integer'
	},
	offset: {
		description: 'Skip records before querying',
		type: 'integer'
	}
])

app.routes.get('/:state/cities/:letter?', 'index', {
	swagger: {
		description: 'Gets a list of cities in a state',
		use: [ 'state', 'pagination' ]
	}
})
```
