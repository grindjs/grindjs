# grind-view

`grind-view` provides tempating for [Grind](https://github.com/grindjs/framework), powered by [Nunjucks](http://mozilla.github.io/nunjucks/).

## Installation

Add `grind-view` to your project:

```bash
npm install grind-view --save
```

## Usage

To use `grind-view` you’ll need to add it to your Grind providers:

```js
import Grind from 'grind-framework'
import { ViewProvider } from 'grind-view'

const app = new Grind()
app.providers.push(ViewProvider)
```

The view provider will configure Nunjucks with Grind and Express, so you can interact with views through the [Express Render API](http://expressjs.com/en/4x/api.html#res.render):

```js
res.render('template.njk', { name: 'Grind' })
```

## View location

By default, `grind-view` tells Nunjucks to look for views in `resources/views`.  You can change this location using the config option below

## Config

If you wish to override the default settings, you should place the following in `config/view.json` in your Grind project.

```json
{
	"path": "resources/views",
	"watch": null,
	"disable_cache": false,
	"autoescape": true,
	"trim_blocks": false,
	"lstrip_blocks": false,
	"throw_on_undefined": false
}
```

___NOTE___: If `watch` is set to null or not defined, it will default to true when local and false in production.
