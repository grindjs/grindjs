# Middleware
Middleware is a convenient way to validate requests, modify responses, and otherwise inject yourself into the HTTP request/response lifecycle.

Grind supports Connect middleware via Express, for full information on Connect middleware, visit the [Connect site](http://senchalabs.github.com/connect).

[[toc]]

## Global Middleware

Global middleware is registered via `app.routes.use()`:

```js
app.routes.use((req, res, next) => {
	if(req.query.password !== 'secret') {
		// This will abort the request
		return next(new ForbiddenError)
	}

	// If they have the correct password
	// call next and continue the request
	next()
})
```

This middleware will now apply to all routes registered _after_ it’s been added.  Any routes registered _before_ will not have the middleware.

> {note} Unlike Express, you can’t pass a path to `use`.  If you’d like to register middleware on a path, you’ll need to add it to a [group with a prefix](routing#route-groups).

## Group Middleware

Group middlware provides an easy way to apply middleware to a collection of routes.  Middleware defined on a group will apply _only_ to routes registered in that group, even if two groups share the same prefix.

You can pass middleware to a group as part of it’s options:

```js
app.routes.group({
	prefix: '/users'
	before: [ formBodyParser, jsonBodyParser ],
	after: [ responseInspector ]
}, routes => {
	routes.get('/', …)
})
```

You can also add middleware to the group via `use`:

```js
app.routes.group(routes => {
	// Before middleware
	routes.use(formBodyParser, jsonBodyParser)

	// Add routes
	routes.post('/test', …)

	// After middleware
	routes.use(responseInspector)
})
```

---

### Cascading Middleware

Middleware in groups cascade downward, so if you nest groups each group will inherit middleware from it’s ancestors and apply them all contained routes:

```js

app.routes.group(routes => {
	routes.use(someMiddleware)
	routes.get('hello')

	routes.group(routes => {
		routes.use(otherMiddleware)
		routes.get('goodbye')
	})
})
```

In this example, the `hello` route will run with `someMiddleware`, and the `goodbye` route will run with `someMiddleware` _and_ `otherMiddleware`.  Each middleware will be called in the order it’s registered.

## Route Middleware

To add middleware to a specific route, you have a couple of options.

You can pass middleware to a route as part of it’s action:

```js
app.routes.post('/', {
	before: [ formBodyParser, jsonBodyParser ],
	after: [ responseInspector ],
	action: …
})
```

You can also add middleware to the route after it’s been created:

```js
app.routes.post('/', …).before(formBodyParser, jsonBodyParser).after(responseInspector)
```

## Middleware Aliases

Passing functions around for middleware can become a bit unwieldy, so Grind let‘s you register middleware onto the router with aliases.

### Registering Middleware

To register middleware, simply call `registerMiddleware` on the Router:

```js
export function MiddlewareProvider(app) {
	app.routes.registerMiddleware('auth', (req, res, next) => {
		if(req.query.password !== 'secret') {
			return next(new ForbiddenError)
		}

		next()
	})
}

MiddlewareProvider.priority = 100
```

### Using Aliases

Once you‘ve registered your alias, you can use it anywhere you’d normally add middleware:

```js
app.routes.use('auth')

app.routes.group({ before: 'auth' }, …)
app.routes.group(routes => {
	routes.use('auth')
})

app.routes.post('/', { before: [ 'auth' ], … })
app.routes.post('/', …).before('auth')
```
