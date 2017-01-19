---
title: "Views"
excerpt: ""
---
Grind Views are powered by [Nunjucks](http://mozilla.github.io/nunjucks/).  For a full overview of syntax and supported features, check out [their documentation](http://mozilla.github.io/nunjucks/templating.html).

Views should be stored in `/resources/views`.
[block:api-header]
{
  "type": "basic",
  "title": "Sending a View Response"
}
[/block]
You can send view responses through [Express’s `res.render()`](http://expressjs.com/en/api.html#res.render):
[block:code]
{
  "codes": [
    {
      "code": "app.routes.get('/', (req, res) => res.render('welcome'))",
      "language": "javascript"
    }
  ]
}
[/block]
This will load `/resources/views/welcome.njk`, process it through Nunjucks and send it to the browser.

### Passing Data to the View

You can pass a second parameter to `res.render` with an object to pass to the view.  The object’s keys are exposed as variables within the view:
[block:code]
{
  "codes": [
    {
      "code": "app.routes.get('/', (req, res) => res.render('welcome', {\n\tnow: new Date()\n}))",
      "language": "javascript"
    }
  ]
}
[/block]
Now in your view you can output `{{ now }}`.
[block:api-header]
{
  "type": "basic",
  "title": "Additional Functionality"
}
[/block]
## Grind View Loader

Grind’s view loader makes referencing views a bit easier/cleaner than vanilla Nunjucks:

* You don’t ever need to include the `.njk` extension when including or rendering a view, Grind will tack it on for you.
* You can reference views via a dot separator instead of a slash separator

These changes allow for tidier syntax when referencing other views:
[block:code]
{
  "codes": [
    {
      "code": "{# Vanilla Nunjucks: #}\n{% extends 'layout/master.njk' %}\n\n{# Grind View Loader: #}\n{% extends 'layout.master' %}",
      "language": "jinja2"
    }
  ]
}
[/block]
## Functions

Views provides two additional functions on top of what Nunjucks already has:

### route

The `route` function allows you to reference a named route and get a generated URL back:
[block:code]
{
  "codes": [
    {
      "code": "<a href=\"{{ route('users.show', user.id) }}\">Go to Profile</a>",
      "language": "jinja2"
    }
  ]
}
[/block]
### markHtml

The `markHtml` function is equivilent to Nunjuck’s [`safe` filter](http://mozilla.github.io/nunjucks/templating.html#autoescaping), except it’s provided as a function.  This allows for you to pass it to other functions:
[block:code]
{
  "codes": [
    {
      "code": "{{ decorateHeader(markHtml('Welcome to <strong>Grind</strong>')) }}",
      "language": "jinja2"
    }
  ]
}
[/block]
## Other Additions

Be sure to check out the documentation for the [Assets](doc:assets) and [HTML Builders](doc:html-builders) providers, as they both provide additional features for views.