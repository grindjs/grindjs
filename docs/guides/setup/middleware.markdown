---
title: "Middleware"
excerpt: ""
---
Middleware is a convenient way to validate requests, modify responses, and otherwise inject yourself into the HTTP request/response lifecycle.

For full information on how Middleware works in Grind, see the comprehensive documentation on the [Express site](https://expressjs.com/en/guide/using-middleware.html).
[block:api-header]
{
  "type": "basic",
  "title": "Global Middleware"
}
[/block]
Global middleware is registered via `app.use()`:
[block:code]
{
  "codes": [
    {
      "code": "app.use((req, res, next) => {\n  if(req.query.password != 'secret') {\n    // This will abort the request\n    return next(new ForbiddenError)\n  }\n  \n  // If they have the correct password\n  // call next and continue the request\n  next()\n})",
      "language": "javascript"
    }
  ]
}
[/block]

[block:api-header]
{
  "type": "basic",
  "title": "Per-Route Middleware"
}
[/block]
You can also add middleware to a specific route.  Check out the [Routing docs](doc:routing#section-action) for full information on how to do this. 
[block:code]
{
  "codes": [
    {
      "code": "app.routes.post('create', …).use(formBodyParser)",
      "language": "javascript"
    }
  ]
}
[/block]