# Views

Grind’s abstract view system allows for integration of any templating engine. Grind ships with first party support for it‘s own templating engine, [Stone](stone), however registering a new engine is straight forward.

Views should be stored in `/resources/views`.

[[toc]]

## Installation

First, add the `grind-view` package via your preferred package manager:

```shell
yarn add grind-view
```

Next, you’ll need to add `ViewProvider` to your app providers in `app/Boostrap.js`:

```js
import Grind from 'grind-framework'
import { ViewProvider } from 'grind-view'

const app = new Grind()
app.providers.push(ViewProvider)
```

## Sending a View Response

You can send view responses through [Express’s `res.render()`](http://expressjs.com/en/api.html#res.render):

```js
app.routes.get('/', (req, res) => res.render('welcome'))
```

This will load `/resources/views/welcome.stone`, process it through Stone and send it to the browser.

### Passing Data to the View

You can pass a second parameter to `res.render` with an object to pass to the view. The object’s keys are exposed as variables within the view:

```js
app.routes.get('/', (req, res) =>
  res.render('welcome', {
    now: new Date(),
  }),
)
```

Now in your view you can output `{{ now }}`.

## Precompiling Views

Views can be precompiled and cached so they’re ready to go in production.

### Caching

To precompile and cache your views, all you need to do is call `view:cache`:

```shell
bin/cli view:cache
```

That‘s it! Regardless of what template engine you use, they will know to read cache during boot.

### Clear Cache

You can quickly clear cache via `view:clear`:

```shell
bin/cli view:clear
```

## Supported Engines

### Stone

Stone is Grind’s default templating engine. For detailed documentation on Stone, check out the [Stone docs](stone).

## Switching Engines

By default, Grind ships with it’s own templating engine, [Stone](stone), however you can easily swap it out for another supported engine (or even build your own!).

To change the engine that Grind uses, just update the `view.json` config file:

```json
{
  "engine": "amazing-new-engine"
}
```
