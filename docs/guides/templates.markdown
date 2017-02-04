# Views
Grind Views are powered by [Nunjucks](http://mozilla.github.io/nunjucks/).  For a full overview of syntax and supported features, check out [their documentation](http://mozilla.github.io/nunjucks/templating.html).

Views should be stored in `/resources/views`.

[[toc]]

## Installation
First, add the `grind-view` package via your preferred package manager:

```shell
npm install --save grind-view
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

## Additional Functionality
### Grind View Loader
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

### Functions
Views provides two additional functions on top of what Nunjucks already has:

#### route
The `route` function allows you to reference a named route and get a generated URL back:

```njk
<a href="{{ route('users.show', user.id) }}">Go to Profile</a>
```

#### markHtml
The `markHtml` function is equivilent to Nunjuck’s [`safe` filter](http://mozilla.github.io/nunjucks/templating.html#autoescaping), except it’s provided as a function.  This allows for you to pass it to other functions:

```njk
{{ decorateHeader(markHtml('Welcome to <strong>Grind</strong>')) }}
```

### Other Additions
Be sure to check out the documentation for the [Assets](assets) and [HTML Builders](html-builders) providers, as they both provide additional features for views.
