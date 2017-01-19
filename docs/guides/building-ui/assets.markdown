# Assets
Assets provides a simple way to work with assets within Grind.  It’s designed to get out of your way and allow you to work without worrying about running a watch command and waiting for files to compile.  Once setup, all you need to do is store your assets in `/resources/assets` and the package will automatically detect changes and compile (and cache) on page load.

In production environments, be sure to run the `assets:publish` command so all assets are precompiled and moved to the public directory, allowing your web server to more effeciently serve them.

## Installing dependencies
Assets comes with built in support for a bunch of asset types, but to maintain flexibility and minimize node_modules bloat, it doesn’t explicitly require any compiler depenencies.  Instead you can pick and choose which you want to use, and install them directly.

Refer to the table below determine which dependencies you’ll need:
| Compiler | Install Command | Description |
| -------- | --------------- | ----------- |
| Babel | `npm install --save-dev babelify browserify` | Provides support for using ES6/7 features in the browser |
| SCSS | `npm install --save-dev node-sass` | Provides SCSS compilation |
| Javascript | `npm install --save-dev uglify-js` | Provides JS minificaiton |
| CSS | `npm install --save-dev clean-css` | Provides CSS minification |
| SVG | `npm install --save-dev svgo` | Provides SVG optimization |

> Don’t worry if you forget to setup a dependency, Assets will let you know what to install if you try to use a compiler that doesn’t have it’s dependencies installed.### Directories & Babel

Most compilers match solely on file extension and don’t care where the file is located as long as it’s in `/resources/assets`.  As an example, as long as the file is called `main.scss`, the SCSS compiler will compile regardless of whether it’s located at `/resources/assets/scss/main.scss` or `/resources/assets/something-entirely-different/main.scss`.

The exception to this rule is Babel.  Since we want to minify plain old JS files, the Babel compiler has an additional rule to ensure it doesn’t conflict with the JS minifier.  All Babel files must be stored in a directory with “babel” in the path.  For example both: `/resources/assets/babel/main.js` and `/resources/assets/tooltip/babel/main.js` will be compiled by Babel, however, `/resources/assets/tooltip/main.js` would not be.

## Simple Usage
Assets provides an `assetPath()` function that will look for your files in `/resources/assets`, so the file referenced in the snippet below should be in `/resources/assets/scss/site.scss`.
```twig
<link type="text/css" rel="stylesheet" href="{{ assetPath('scss/site.scss') }}" />
```

## Advanced Usage
Assets also ships with a full asset container system to drop into views in a much cleaner way.  It provides tags for `asset`, `style`, `script`, `scss`, `babel` and many more.

To use these tags, you must first configure your master layout to include them:

```twig
<!DOCTYPE html>
<html>
	<head>
		{# …head… #}
		{% asset 'render', 'styles' %} {# <-- Renders included styles #}
	</head>
	<body>
		{# …body… #}
		{% asset 'render', 'scripts' %} {# <-- Renders included scripts #}
	</body>
</html>
```

Once you’ve added those two lines to your master layout, you can begin using the view tags:

### Styles
Assets supports the following style-related view tags:

* `style 'http://url'` — will load any style path relative to `/resources/assets` or a fully qualified URL
* `css 'main'` — will load `/resources/assets/css/main.css`
* `scss 'main'` — will load `/resources/assets/scss/main.scss`
* `sass 'main'` — will load `/resources/assets/sass/main.sass`

The following tags are also supported, but compilers are not yet built for them:
* `less 'main'` — will load `/resources/assets/less/main.less`
* `styl 'main'` — will load `/resources/assets/styl/main.styl`
* `stylus 'main'` — will load `/resources/assets/styl/main.stylus`

### Scripts
Assets supports the following script-related view tags:

* `script 'http://url'` — will load any script path relative to `/resources/assets` or a fully qualified URL
* `js 'main'` — will load `/resources/assets/js/main.js`
* `babel 'main'` — will load `/resources/assets/babel/main.babel`

The following tags are also supported, but compilers are not yet built for them:
* `coffee 'main'` — will load `/resources/assets/coffee/main.coffee`

### Usage
Now that you know how the tags work, here’s an example of them in use:
```twig
{% extends 'layout/master.njk' %}

{% babel 'welcome' %}
{% scss 'welcome' %}

{% block content %}
	{# …some content… #}
{% endblock %}
```

When this view renders, it will load look something like this:
```html
<!DOCTYPE html>
<html>
	<head>
		<!-- …head… -->
		<link media="all" type="text/css" rel="stylesheet" href="http://localhost:3100/assets/scss/welcome.scss">
	</head>
	<body>
		<!-- …body… -->
		<script src="http://localhost:3100/assets/babel/app.js"></script>
	</body>
</html>
```

## Deployments
During your deploy process, you should run `bin/cli assets:publish`.  This will precompile all assets and move them into the `public/` directory.

As long as you’re using `assetPath()` or one of the asset container tags to reference your assets, they’ll start serving the compiled versions automatically.

## Writing Your Own Compiler
Assets’ compilation system is fully extendable.

To write your own compiler, you must first extend the `Compiler` class from `grind-assets` and then implement the required methods:

```js
import { Compiler } from 'grind-assets'
import PngCrusher from 'png-crusher'
import fs from 'fs-promise'

export class PngCompiler extends Compiler {
	// List of supported extensions
	supportedExtensions = [ 'png' ]

	// The higher the value the more likely
	// it is to be treated as a match, should
	// two compilers want match for the same asset
	priority = 100

	compile(pathname, context) {
		if(!this.autoMinify) {
			return fs.readFile(pathname)
		}

		return PngCrusher.crush(pathname)
	}

	mime() { return 'image/png' }
	type() { return 'img' }
	extension() { return 'png' }

}
```

Now create a new `AssetCompilersProvider` to register the compiler:

```js
import 'App/Assets/PngCompiler'

export function AssetCompilersProvider(app) {
	app.assets.registerCompiler(PngCompiler)
}
```

The only other thing you need to is register your new `AssetCompilersProvider` in `app/Bootstrap.js` and your PNGs should start being crushed.

For more information on what Compilers can do, check out the existing compilers in Grind’s source code: [github.com/grindjs/assets/tree/master/src/Compilers](https://github.com/grindjs/assets/tree/master/src/Compilers).
