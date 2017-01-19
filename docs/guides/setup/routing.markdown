---
title: "Routing"
excerpt: ""
---
The standard way to register routes in Grind is via a Routes [provider](doc:providers).  The routes provider is located at `app/Providers/RoutesProvider.js`. 

Under the hood, Grind’s router is based on [Express’s router](http://expressjs.com/en/starter/basic-routing.html), however it provides a different interace with some additional functionality.  Don’t fear though — this doesn’t come at a performance cost.  All Grind route’s immediately turn into Express routes at boot time, think of it as syntactic sugar.
[block:api-header]
{
  "type": "basic",
  "title": "Basic Interface"
}
[/block]
Grind’s router is accessible via `app.routes`.

The router supports `GET`, `POST`, `PUT`, `PATCH` and `DELETE` routes. All five have the same method signature:
[block:code]
{
  "codes": [
    {
      "code": "app.routes.get(path, action, context)\napp.routes.post(path, action, context)\napp.routes.put(path, action, context)\napp.routes.patch(path, action, context)\napp.routes.delete(path, action, context)",
      "language": "javascript"
    }
  ]
}
[/block]

[block:callout]
{
  "type": "info",
  "body": "If you’re coming from Express, note that Grind’s routing methods are available via `app.routes`, not directly through `app`."
}
[/block]
## Parameter Overview

### path
The first parameter, `path`, is the routable path. `app.routes.get('/home', …)` will be called when  you go to `http://host/home` — unless you’re nested in a prefixed group (more on that below).

### action
The second parameter, `action`, is what tells the router what to do when the route is called.

This can be as simple as a callback function:
[block:code]
{
  "codes": [
    {
      "code": "app.routes.get('home', (req, res) => res.send('Welcome Home!'))",
      "language": "javascript"
    }
  ]
}
[/block]
Or it can pass a full object with middleware:
[block:code]
{
  "codes": [
    {
      "code": "app.routes.get('home', {\n \t// This can be a function, or the name of a method when nested inside of a controller group\n\tmethod: 'methodName',\n\n\t// Simple middleware — called before the action method is called\n\tuse: [ formBodyParser, jsonBodyParser ],\n\t\n\t// Advanced middleware\n\tuse: {\n\t\t// Called before the action method is called\n\t\tbefore: [ formBodyParser, jsonBodyParser ],\n\t\t\n\t\t// Called after the action method is called\n\t\tafter: [ responseInspector ]\n\t}\n})",
      "language": "javascript"
    }
  ]
}
[/block]

[block:callout]
{
  "type": "info",
  "body": "Calling `use` with an array of middleware is the same as doing `use: { before: [ …middleware… ] }`."
}
[/block]
### context

The third and final parameter, `context`, is an optional context object that is set on the route itself (accessible via `route.context`).  By default this does nothing, but it provides a way to send additional context to other Grind providers.  For instance, Grind’s [Swagger provider](doc:swagger)  leverages the `context` param to build out rich documentation around your routes.

### Alternate Middleware Registration

Above, we register middleware through the route action, but we can also do it after the routes created:
[block:code]
{
  "codes": [
    {
      "code": "app.routes.post('create', …).use(formBodyParser).use(jsonBodyParser)\napp.routes.post('create', …).useBefore(formBodyParser)\napp.routes.get('home', …).useAfter(responseInspector)",
      "language": "javascript"
    }
  ]
}
[/block]
These methods are chainable.
[block:callout]
{
  "type": "info",
  "body": "`use` and `useBefore` are aliases."
}
[/block]

[block:api-header]
{
  "type": "basic",
  "title": "Route Parameters"
}
[/block]
Route parameters provide a way for you to build dynamic routes without needing to define every possible route ahead of time, for instance:
[block:code]
{
  "codes": [
    {
      "code": "app.routes.get('/users/:id/profile', (req, res) => {\n\tres.send(`Show ${req.params.id}`)\n})",
      "language": "javascript"
    }
  ]
}
[/block]
This allows for the `:id` segment of the URL to be any value.  The value of route parameters are available via `req.params.parameterName`.

### Optional Parameters

In the previous example `:id` is a required parameter, but routing also supports optional parameters:
[block:code]
{
  "codes": [
    {
      "code": "app.routes.get('/posts/:filter?', (req, res) => {\n\tif(req.params.filter) {\n\t\tres.send(`Showing posts for ${req.params.filter}`)\n\t} else {\n\t\tres.send(`Showing all posts`)\n\t}\n})",
      "language": "javascript"
    }
  ]
}
[/block]
Now the route action will be called for both `/posts` and `/posts/trending`

### Parameter Constraints

So far, in all examples, any arbitrary values can be passed into the routes as parameters.  This isn’t ideal if all you’re looking for is a numeric `id`, as it forces you to check the data and handle when it’s incorrect.

You can define parameter patterns ahead of time to restrict what data is passed in:
[block:code]
{
  "codes": [
    {
      "code": "app.routes.pattern('id', '[0-9]+')\napp.routes.get('/users/:id/profile', (req, res) => {\n\tres.send(`Show ${req.params.id}`)\n})",
      "language": "javascript"
    }
  ]
}
[/block]
Now this user profile route will only be resolved when `:id` is a number, if any non-numeric data is passed, it won’t be captured by this route, and if no other route supports it, it will result in a 404.

[block:callout]
{
  "type": "info",
  "body": "Currently Grind requires you define a pattern _before_ you use it in a route.  In the future this should allow for patterns to be defined at any point, or even only on the route itself.  Pull requests welcome!"
}
[/block]
### Parameter Bindings

You can also bind parameters to a function to transform the value, before your action is called.  In the `/users/:id` route above, your action would need to go out, find the user and handle a scenario where the user isn’t found.  This isn’t ideal as you end up with cluttered, repetitive code.

Using parameter bindings, we can simplify this:
[block:code]
{
  "codes": [
    {
      "code": "app.routes.pattern('user', '[0-9]+')\napp.routes.bind('user', (value, resolve, reject) => {\n\tUser.find(value).then(model => {\n\t\tif(!model) {\n\t\t\tthrow NotFoundError\n\t\t}\n\t\t\n\t\tresolve(model)\n\t}).catch(err => reject(err))\n})\n\napp.routes.get('/users/:user/profile', (req, res) => {\n\tres.send(`Show ${req.params.user.name}`)\n})\n\napp.routes.get('/users/:user/message', (req, res) => {\n\tres.send(`Send a message to ${req.params.user.name}`)\n})",
      "language": "javascript"
    }
  ]
}
[/block]
Now the actions of the user routes can safely assume it will have the user object, as they will never be called if the user parameter doesn’t bind.
[block:api-header]
{
  "type": "basic",
  "title": "Named Routes"
}
[/block]
Once you’ve defined a route, you can also name them for convenient referencing when generating URLs:
[block:code]
{
  "codes": [
    {
      "code": "app.routes.get('/users/:id/profile', (req, res) => {\n\tres.send(`Show ${req.params.id}`)\n}).as('users.profile')",
      "language": "javascript"
    }
  ]
}
[/block]
### Generating URLs

Now that your route is named, you can use it to generate URLs via Grind’s URL generator:
[block:code]
{
  "codes": [
    {
      "code": "Log.info('Profile URL:', app.url.route('users.profile', 5))\n// Profile URL: http://host/users/5/profile",
      "language": "javascript"
    }
  ]
}
[/block]
The URL generator also supports passing in a keyed object, which you can use to build a query string:
[block:code]
{
  "codes": [
    {
      "code": "Log.info('Profile URL:', app.url.route('users.profile', {\n\tid: 5,\n\tsection: 'about',\n\tfrom: 'home'\n}))\n// Profile URL: http://host/users/5/profile?section=about&from=home",
      "language": "javascript"
    }
  ]
}
[/block]

[block:api-header]
{
  "type": "basic",
  "title": "Route Groups"
}
[/block]
Grind’s router also supports groups.  Groups allow you to provide a common prefix for a batch of routes, as well as a common controller (more below).
[block:code]
{
  "codes": [
    {
      "code": "app.routes.group({ prefix: '/users/:id' }, routes => {\n\troutes.get('/', …) // /users/:id\n\troutes.get('profile', …) // /users/:id/profile\n\troutes.get('message', …) // /users/:id/message\n\troutes.get('edit', …) // /users/:id/edit\n})",
      "language": "javascript"
    }
  ]
}
[/block]
By grouping routes with common prefixes together, you’re able to end up with [DRY](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself) code that’s much easier to read.
[block:api-header]
{
  "type": "basic",
  "title": "Controller Routes"
}
[/block]
Putting it all together, we can build rich controller routes with everything above:
[block:code]
{
  "codes": [
    {
      "code": "import 'App/Controllers/UserController'\n\napp.routes.group({ prefix: '/users', controller: UserController }, routes => {\n\t// Routes GET /users to UserController.index(req, res)\n\troutes.get('/', 'index').as('users.index')\n\n\t// Routes POST /users to UserController.create(req, res)\n\troutes.post('/', 'create').use(formBodyParser).as('users.create')\n\n\t// Routes GET /users/id to UserController.show(req, res)\n\troutes.get('/:id', 'show').as('users.show')\n})",
      "language": "javascript"
    }
  ]
}
[/block]
If the a route group’s controller is set to a class it will create an instance via `new UserController(app)`.  If your controller constructor needs additional parameters, you can also pass in a controller instance directly:
[block:code]
{
  "codes": [
    {
      "code": "import 'App/Controllers/UserController'\nimport 'App/Repositores/UserRepository'\n\nconst users = new UserController(app, new UserRepository)\napp.routes.group({ prefix: '/users', controller: users }, routes => {\n\t// …routes…\n})",
      "language": "javascript"
    }
  ]
}
[/block]

[block:callout]
{
  "type": "warning",
  "body": "Grind uses a single controller instance for _all_ requests to that controller.  If you’re coming from a language/framework that uses a new controller instance for each request, it’s important to remember how this impacts your code.  You can no longer assume that state set on a controller will only apply to the current request context."
}
[/block]