# grind-html

`grind-html` provides an HTML and Form builder for [Grind](https://github.com/grindjs/framework).  The original source for `HtmlBuilder` and `FormBuilder` has been ported from [LaravelCollective/html](https://github.com/LaravelCollective/html).

## Installation

Add `grind-html` to your project:

```bash
npm install grind-html --save
```

## Usage

To use `grind-html` you’ll need to add it to your Grind providers:

```js
import Grind from 'grind-framework'
import {HtmlProvider} from 'grind-html'

const app = new Grind()
app.providers.push(HtmlProvider)
```

`grind-html` is meant to be used with [`grind-view`](https://github.com/grindjs/view):

```twig
{{ html.linkRoute('route.name', 'Some Title', { param: 'a' }) }}
{{ html.style('css/main.scss')) }}
```

The `HtmlBuilder` and `FormBuilder` instances are also available via `app.get('html')` and `app.get('form')` respectively.
