# Views
Grind’s abstract view system allows for integration of any templating engine.  Grind has first party support for it‘s own templating engine, [Stone](stone) as well as the popular [Nunjucks](http://mozilla.github.io/nunjucks/) engine.

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

This will load `/resources/views/welcome.njk`, process it through Nunjucks and send it to the browser.

### Passing Data to the View
You can pass a second parameter to `res.render` with an object to pass to the view.  The object’s keys are exposed as variables within the view:

```js
app.routes.get('/', (req, res) => res.render('welcome', {
	now: new Date()
}))
```

Now in your view you can output `{{ now }}`.

## Precompiling Views
Views can be precompiled and cached so they’re ready to go in production.

### Caching
To precompile and cache your views, all you need to do is call `view:cache`:

```shell
bin/cli view:cache
```

That‘s it!  Regardless of what template engine you use, they will know to read cache during boot.

### Clear Cache
You can quickly clear cache via `view:clear`:

```shell
bin/cli view:clear
```

## Supported Engines

### Stone
Stone is Grind‘s default templating engine.  For detailed documentation on Stone, check out the [Stone docs](stone).

### Nunjucks
Grind‘s integration with Nunjucks offers a few enhancements to make it feel at home within Grind.

#### View Loading
Grind’s view loader makes referencing views a bit easier/cleaner than vanilla Nunjucks:

* You don’t ever need to include the `.njk` extension when including or rendering a view, Grind will tack it on for you.
* You can reference views via a dot separator instead of a slash separator

These changes allow for tidier syntax when referencing other views:

```njk
{# Vanilla Nunjucks: #}
{% extends 'layout/master.njk' %}

{# Grind View Loader: #}
{% extends 'layout.master' %}
```

#### Functions
Views provides two additional functions on top of what Nunjucks already has:

##### route
The `route` function allows you to reference a named route and get a generated URL back:

```njk
<a href="{{ route('users.show', user.id) }}">Go to Profile</a>
```

##### markHtml
The `markHtml` function is equivilent to Nunjuck’s [`safe` filter](http://mozilla.github.io/nunjucks/templating.html#autoescaping), except it’s provided as a function:

```njk
{{ decorateHeader(markHtml('Welcome to <strong>Grind</strong>')) }}
```

#### Other Additions
Be sure to check out the documentation for the [Assets](assets) and [HTML Builders](html-builders) providers, as they both provide additional features for Nunjucks templates.

## Switching Engines
By default, Grind ships with it’s own templating engine, [Stone](stone), however you can easily swap it out for Nunjucks (or even build your own!).

To use Nunjucks intead of Stone, update your view config:

```json
{
	"engine": "nunjucks"
}
```

You’ll also need to add the Grind Nunjucks integration:

```shell
yarn add grind-nunjucks
```

And that’s it!  The view factory will automatically load the Nunjucks engine from `grind-nunjucks`, so no need to register a provider.
