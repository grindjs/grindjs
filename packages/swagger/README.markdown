# grind-swagger

`grind-swagger` is a swagger provider for `Grind`.  It’ll create `/swagger.json` endpoint on your API and expose any documented* routes.

## Installation

Add `grind-swagger` to your project:

```bash
npm install shnhrrsn/grind-swagger --save
```

## Usage

To use `grind-swagger` you’ll need to add it to your `Grind` providers:

```js
import Grind from 'grind'

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
