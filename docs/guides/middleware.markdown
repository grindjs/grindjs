# Middleware
Middleware is a convenient way to validate requests, modify responses, and otherwise inject yourself into the HTTP request/response lifecycle.

For full information on how Middleware works in Grind, see the comprehensive documentation on the [Express site](https://expressjs.com/en/guide/using-middleware.html).

## Global Middleware
Global middleware is registered via `app.use()`:
```js
app.use((req, res, next) => {
  if(req.query.password !== 'secret') {
    // This will abort the request
    return next(new ForbiddenError)
  }

  // If they have the correct password
  // call next and continue the request
  next()
})
```

## Per-Route Middleware
You can also add middleware to a specific route.  Check out the [Routing docs](routing#section-action) for full information on how to do this.
```js
app.routes.post('create', …).use(formBodyParser)
```
