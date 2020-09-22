# Routing

The standard way to register routes in Grind is via a Routes [provider](providers). The routes provider is located at `app/Providers/RoutesProvider.js`.

Under the hood, Grind’s router is based on [Express’s router](http://expressjs.com/en/starter/basic-routing.html), however it provides a different interface with some additional functionality. Don’t fear though — this doesn’t come at a performance cost. All Grind route’s immediately turn into Express routes at boot time, think of it as syntactic sugar.

[[toc]]

## Basic Interface

Grind’s router is accessible via `app.routes`.

The router supports `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, and `OPTIONS` routes. All 7 have the same method signature:

```js
app.routes.get(path, action, context)
app.routes.post(path, action, context)
app.routes.put(path, action, context)
app.routes.patch(path, action, context)
app.routes.delete(path, action, context)
app.routes.head(path, action, context)
app.routes.options(path, action, context)
```

If you need to respond to multiple HTTP methods for the same route, you can also use `match`:

```js
app.routes.match(methods, path, action, context)
```

###### Example

```js
app.routes.match([ "post", "put" ], "/users" (req, res) => {
	res.send("This will respond to both POST and PUT requests.")
})
```

> {tip} If you’re coming from Express, note that Grind’s routing methods are available via `app.routes`, not directly through `app`.

## Parameter Overview

#### path

The first parameter, `path`, is the routable path. `app.routes.get('/home', …)` will be called when you go to `http://host/home` — unless you’re nested in a prefixed group (more on that below).

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

  // Called before the action method is called
  before: [formBodyParser, jsonBodyParser],

  // Called after the action method is called
  after: [responseInspector],
})
```

Above, we register middleware through the route action, however we can also add middleware to the route after it’s been created:

```js
app.routes.post('create', …).before(formBodyParser).before(jsonBodyParser)
app.routes.get('home', …).after(responseInspector)
```

For more information of middleware, check out the full [Middleware guide](middleware).

#### context

The third and final parameter, `context`, is an optional context object that is set on the route itself (accessible via `route.context`). By default this does nothing, but it provides a way to send additional context to other Grind providers. For instance, Grind’s [Swagger provider](swagger) leverages the `context` param to build out rich documentation around your routes.

## Route Parameters

Route parameters provide a way for you to build dynamic routes without needing to define every possible route ahead of time, for instance:

```js
app.routes.get('users/:id/profile', (req, res) => {
  res.send(`Show ${req.params.id}`)
})
```

This allows for the `:id` segment of the URL to be any value. The value of route parameters are available via `req.params.parameterName`.

### Optional Parameters

In the previous example `:id` is a required parameter, but routing also supports optional parameters:

```js
app.routes.get('posts/:filter?', (req, res) => {
  if (!req.params.filter) {
    return res.send(`Showing all posts`)
  }

  return res.send(`Showing posts for ${req.params.filter}`)
})
```

Now the route action will be called for both `/posts` and `/posts/trending`

### Parameter Constraints

So far, in all examples, any arbitrary values can be passed into the routes as parameters. This isn’t ideal if all you’re looking for is a numeric `id`, as it forces you to check the data and handle when it’s incorrect.

You can define parameter patterns ahead of time to restrict what data is passed in:

```js
app.routes.pattern('id', '[0-9]+')
app.routes.get('users/:id/profile', (req, res) => {
  res.send(`Show ${req.params.id}`)
})
```

Now this user profile route will only be resolved when `:id` is a number, if any non-numeric data is passed, it won’t be captured by this route, and if no other route supports it, it will result in a 404.

> {note} Currently Grind requires you define a pattern _before_ you use it in a route. In the future this should allow for patterns to be defined at any point, or even only on the route itself. Pull requests welcome!

### Parameter Bindings

You can also bind parameters to a function to transform the value, before your action is called. In the `/users/:id` route above, your action would need to go out, find the user and handle a scenario where the user isn’t found. This isn’t ideal as you end up with cluttered, repetitive code.

Using parameter bindings, we can simplify this:

```js
app.routes.pattern('user', '[0-9]+')
app.routes.bind('user', value => User.findOrFail(value))

app.routes.get('users/:user/profile', (req, res) => {
  res.send(`Show ${req.params.user.name}`)
})

app.routes.get('users/:user/message', (req, res) => {
  res.send(`Send a message to ${req.params.user.name}`)
})
```

Now the actions of the user routes can safely assume it will have the user object, as they will never be called if the user parameter doesn’t bind.

#### Parameter Bindings without Promises

If you need to bind with regular callbacks and not use promises, your callback is invoked with additional `resolve` and `reject` parameters:

```js
app.routes.bind('user', (value, resolve, reject) => {
  User.find(value, (err, model) => {
    if (!err && !model) {
      err = new NotFoundError()
    }

    if (err) {
      return reject(err)
    }

    resolve(model)
  })
})
```

## Named Routes

Once you’ve defined a route, you can also name them for convenient referencing when generating URLs:

```js
app.routes
  .get('users/:id/profile', (req, res) => {
    res.send(`Show ${req.params.id}`)
  })
  .as('users.profile')
```

### Generating URLs

Now that your route is named, you can use it to generate URLs via Grind’s URL generator:

```js
Log.info('Profile URL:', app.url.route('users.profile', 5))
// Profile URL: http://host/users/5/profile
```

The URL generator also supports passing in a keyed object, which you can use to build a query string:

```js
Log.info(
  'Profile URL:',
  app.url.route('users.profile', {
    id: 5,
    section: 'about',
    from: 'home',
  }),
)
// Profile URL: http://host/users/5/profile?section=about&from=home
```

## Route Groups

Grind’s router also supports groups. Groups allow you to provide a common prefix for a batch of routes, as well as a common controller (more below).

```js
app.routes.group({ prefix: 'users/:id' }, routes => {
	routes.get('/', …) // /users/:id
	routes.get('profile', …) // /users/:id/profile
	routes.get('message', …) // /users/:id/message
	routes.get('edit', …) // /users/:id/edit
})
```

By grouping routes with common prefixes together, you’re able to end up with [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) code that’s much easier to read.

## Route Files

For large applications, a single routes file can become monolithic and unwieldy. Fortunately, Grind provides a simple way for you to split up your routes into multiple files and easily load them.

The `routes.load` function accepts a single parameter that will load a routes file or a directory relative to the current file invoking it.

If you specify a directory, it will first check for an `index.js` file, if no index file is provided, it will load all `*.js` files as routes.

#### Single File

```js
app.routes.load('./UserRoutes')
```

```js
export function UserRoutes(routes) {
	routes.group({ prefix: 'users' }, routes => {
		routes.get(':id', …)
	})
}
```

You can even specify options directly on your route to avoid needing to nest in another group:

```js
UserRoutes.options = { prefix: 'users' }
export function UserRoutes(routes) {
	routes.get(':id', …)
}
```

---

#### Routes Directory

Assuming the following directory structure:

```
┌─ Providers
│  └── RoutesProvider.js
└─ Routes
   ├── PublicRoutes
   │  ├─── PostsRoutes.js
   │  ├─── TagsRoutes.js
   ├── AuthenticatedRoutes
   │  ├─── AdminRoutes.js
   │  ├─── DashboardRoutes.js
   │  └─── UserRoutes.js
   └── index.js
```

#### Providers/RoutesProvider.js

```js
export function RoutesProvider(app) {
  app.routes.load('../Routes')
}
```

In this example, `routes.load` will first check for if `../Routes/index.js` exists, see that it does and then load it.

#### Routes/index.js

```js
export function Routes(routes) {
  routes.load('./PublicRoutes')
  routes.group({ before: 'auth' }, routes => {
    routes.load('./AuthenticatedRoutes')
  })
}
```

In both of these examples, `routes.load` will check if the respective `index.js` files exist (`PublicRoutes/index.js` and `AuthenticatedRoutes/index.js`), and once it sees that they don’t, it’ll look for all `*.js` files within those directories and load them alphabetically.

> {note} When using an `index.js` file, it’s important that you export a function with the same name as the enclosing directory. As you can see above, our `Routes/index.js` file exports a function called `Routes`.

#### Customizing Load Order

By default, when a directory is loaded, `routes.load` will load them alphabetically. If you need to ensure a certain order, you can add a `priority` property to one or all of the files:

```js
export function UserRoutes(routes) {
	routes.group({ prefix: 'users' }, routes => {
		routes.get(':id', …)
	})
}

UserRoutes.priority = 1000
```

All route loaders that have a priority will be loaded first and then any loaders that do not have an explicit priority will be loaded alphabetically.

## Controller Routes

Putting it all together, we can build rich controller routes with everything above:

```js
import 'App/Controllers/UserController'

app.routes.group({ prefix: 'users', controller: UserController }, routes => {
  // Routes GET /users to UserController.index(req, res)
  routes.get('/', 'index').as('users.index')

  // Routes POST /users to UserController.create(req, res)
  routes.post('/', 'create').before(formBodyParser).as('users.create')

  // Routes GET /users/id to UserController.show(req, res)
  routes.get(':id', 'show').as('users.show')
})
```

If the a route group’s controller is set to a class it will create an instance via `new UserController(app)`. If your controller constructor needs additional parameters, you can also pass in a controller instance directly:

```js
import 'App/Controllers/UserController'
import 'App/Repositores/UserRepository'

const users = new UserController(app, new UserRepository())
app.routes.group({ prefix: 'users', controller: users }, routes => {
  // …routes…
})
```

> {note} Grind uses a single controller instance for _all_ requests to that controller. If you’re coming from a framework that uses a new controller instance for each request, it’s important to remember how this impacts your code. You can’t assume that state set on a controller will only apply to the current request context.

## Resource Controllers

In addition to regular controller routes, Grind also supports `resource` routes which enable you to quickly build RESTful controllers.

```js
app.routes.resource('users', UserController)
```

This will now create the following routes:

### Controller Actions

| Method    | URI                | Action  | Route Name    |
| --------- | ------------------ | ------- | ------------- |
| GET       | `users`            | index   | users.index   |
| GET       | `users/create`     | create  | users.create  |
| POST      | `users`            | store   | users.store   |
| GET       | `users/:user`      | show    | users.show    |
| GET       | `users/:user/edit` | edit    | users.edit    |
| PUT/PATCH | `users/:user`      | update  | users.update  |
| DELETE    | `users/:user`      | destroy | users.destroy |

The router will check to make sure each action has a corresponding method in the controller. If an action is not found, the route will not be created.

### Additional Routes

If you need to add additional routes to your resource, you can pass a callback function to as the last parameter of `resource` to add routes within the resource group:

```js
app.routes.resource('users', UsersController, routes => {
  routes.get('trending', 'trending').as('users.trending')
})
```

The callback function will be called before any of the default resource routes are added. Any routes added in the callback will be prefixed with the resource path.
