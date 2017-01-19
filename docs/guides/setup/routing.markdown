# Routing
The standard way to register routes in Grind is via a Routes [provider](doc:providers).  The routes provider is located at `app/Providers/RoutesProvider.js`.

Under the hood, Grind’s router is based on [Express’s router](http://expressjs.com/en/starter/basic-routing.html), however it provides a different interace with some additional functionality.  Don’t fear though — this doesn’t come at a performance cost.  All Grind route’s immediately turn into Express routes at boot time, think of it as syntactic sugar.

## Basic Interface
Grind’s router is accessible via `app.routes`.

The router supports `GET`, `POST`, `PUT`, `PATCH` and `DELETE` routes. All five have the same method signature:
```js
app.routes.get(path, action, context)
app.routes.post(path, action, context)
app.routes.put(path, action, context)
app.routes.patch(path, action, context)
app.routes.delete(path, action, context)
```

> If you’re coming from Express, note that Grind’s routing methods are available via `app.routes`, not directly through `app`.

## Parameter Overview
#### path
The first parameter, `path`, is the routable path. `app.routes.get('/home', …)` will be called when  you go to `http://host/home` — unless you’re nested in a prefixed group (more on that below).

#### action
The second parameter, `action`, is what tells the router what to do when the route is called.

This can be as simple as a callback function:
```js
app.routes.get('home', (req, res) => res.send('Welcome Home!'))
```

Or it can pass a full object with middleware:
```js
app.routes.get('home', {
	// This can be a function, or the name of a method when nested inside of a controller group
	method: 'methodName',

	// Simple middleware — called before the action method is called
	use: [ formBodyParser, jsonBodyParser ],

	// Advanced middleware
	use: {
		// Called before the action method is called
		before: [ formBodyParser, jsonBodyParser ],

		// Called after the action method is called
		after: [ responseInspector ]
	}
})
```

> Calling `use` with an array of middleware is the same as doing `use: { before: [ …middleware… ] }`.

#### context

The third and final parameter, `context`, is an optional context object that is set on the route itself (accessible via `route.context`).  By default this does nothing, but it provides a way to send additional context to other Grind providers.  For instance, Grind’s [Swagger provider](doc:swagger)  leverages the `context` param to build out rich documentation around your routes.

### Alternate Middleware Registration
Above, we register middleware through the route action, but we can also do it after the routes created:
```js
app.routes.post('create', …).use(formBodyParser).use(jsonBodyParser)
app.routes.post('create', …).useBefore(formBodyParser)
app.routes.get('home', …).useAfter(responseInspector)
```

These methods are chainable.

> `use` and `useBefore` are aliases.

## Route Parameters
Route parameters provide a way for you to build dynamic routes without needing to define every possible route ahead of time, for instance:
```js
app.routes.get('users/:id/profile', (req, res) => {
	res.send(`Show ${req.params.id}`)
})
```

This allows for the `:id` segment of the URL to be any value.  The value of route parameters are available via `req.params.parameterName`.

### Optional Parameters
In the previous example `:id` is a required parameter, but routing also supports optional parameters:
```js
app.routes.get('posts/:filter?', (req, res) => {
	if(!req.params.filter) {
		return res.send(`Showing all posts`)
	}

	return res.send(`Showing posts for ${req.params.filter}`)
})
```

Now the route action will be called for both `/posts` and `/posts/trending`

### Parameter Constraints
So far, in all examples, any arbitrary values can be passed into the routes as parameters.  This isn’t ideal if all you’re looking for is a numeric `id`, as it forces you to check the data and handle when it’s incorrect.

You can define parameter patterns ahead of time to restrict what data is passed in:
```js
app.routes.pattern('id', '[0-9]+')
app.routes.get('users/:id/profile', (req, res) => {
	res.send(`Show ${req.params.id}`)
})
```

Now this user profile route will only be resolved when `:id` is a number, if any non-numeric data is passed, it won’t be captured by this route, and if no other route supports it, it will result in a 404.

> Currently Grind requires you define a pattern _before_ you use it in a route.  In the future this should allow for patterns to be defined at any point, or even only on the route itself.  Pull requests welcome!

### Parameter Bindings
You can also bind parameters to a function to transform the value, before your action is called.  In the `/users/:id` route above, your action would need to go out, find the user and handle a scenario where the user isn’t found.  This isn’t ideal as you end up with cluttered, repetitive code.

Using parameter bindings, we can simplify this:
```js
app.routes.pattern('user', '[0-9]+')
app.routes.bind('user', (value, resolve, reject) => {
	User.find(value).then(model => {
		if(!model) {
			throw NotFoundError
		}

		return resolve(model)
	}).catch(err => reject(err))
})

app.routes.get('users/:user/profile', (req, res) => {
	res.send(`Show ${req.params.user.name}`)
})

app.routes.get('users/:user/message', (req, res) => {
	res.send(`Send a message to ${req.params.user.name}`)
})
```

Now the actions of the user routes can safely assume it will have the user object, as they will never be called if the user parameter doesn’t bind.

## Named Routes
Once you’ve defined a route, you can also name them for convenient referencing when generating URLs:

```js
app.routes.get('users/:id/profile', (req, res) => {
	res.send(`Show ${req.params.id}`)
}).as('users.profile')
```

### Generating URLs
Now that your route is named, you can use it to generate URLs via Grind’s URL generator:
```js
Log.info('Profile URL:', app.url.route('users.profile', 5))
// Profile URL: http://host/users/5/profile
```

The URL generator also supports passing in a keyed object, which you can use to build a query string:
```js
Log.info('Profile URL:', app.url.route('users.profile', {
	id: 5,
	section: 'about',
	from: 'home'
}))
// Profile URL: http://host/users/5/profile?section=about&from=home
```

## Route Groups
Grind’s router also supports groups.  Groups allow you to provide a common prefix for a batch of routes, as well as a common controller (more below).
```js
app.routes.group({ prefix: 'users/:id' }, routes => {
	routes.get('/', …) // /users/:id
	routes.get('profile', …) // /users/:id/profile
	routes.get('message', …) // /users/:id/message
	routes.get('edit', …) // /users/:id/edit
})
```

By grouping routes with common prefixes together, you’re able to end up with [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) code that’s much easier to read.

## Controller Routes
Putting it all together, we can build rich controller routes with everything above:
```js
import 'App/Controllers/UserController'

app.routes.group({ prefix: 'users', controller: UserController }, routes => {
	// Routes GET /users to UserController.index(req, res)
	routes.get('/', 'index').as('users.index')

	// Routes POST /users to UserController.create(req, res)
	routes.post('/', 'create').use(formBodyParser).as('users.create')

	// Routes GET /users/id to UserController.show(req, res)
	routes.get(':id', 'show').as('users.show')
})
```

If the a route group’s controller is set to a class it will create an instance via `new UserController(app)`.  If your controller constructor needs additional parameters, you can also pass in a controller instance directly:
```js
import 'App/Controllers/UserController'
import 'App/Repositores/UserRepository'

const users = new UserController(app, new UserRepository)
app.routes.group({ prefix: 'users', controller: users }, routes => {
	// …routes…
})
```

> Grind uses a single controller instance for _all_ requests to that controller.  If you’re coming from a language/framework that uses a new controller instance for each request, it’s important to remember how this impacts your code.  You can no longer assume that state set on a controller will only apply to the current request context.
