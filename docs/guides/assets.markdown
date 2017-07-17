# Assets
Assets provides a simple way to work with assets within Grind.  It’s designed to get out of your way and allow you to work without worrying about running a watch command and waiting for files to compile.

Once setup, all you need to do is store your assets in `resources/assets` and the package will automatically detect changes and compile (and cache) on page load.

[[toc]]

## Installation
First, add the `grind-assets` package via your preferred package manager:

```shell
npm install --save grind-assets
```

Next, you’ll need to add `AssetsProvider` to your app providers in `app/Boostrap.js`:

```js
import Grind from 'grind-framework'
import { AssetsProvider } from 'grind-assets'

const app = new Grind()
app.providers.push(AssetsProvider)
```

### Dependencies
Assets comes with built in support for numerous asset types, however in order to maintain flexibility and minimize package bloat, it doesn’t explicitly require any compiler depenencies.  Instead you can pick and choose which you want to use, and install them directly.

Refer to the table below determine which dependencies you’ll need:

| Compiler | Install Command | Description |
| -------- | --------------- | ----------- |
| Babel | `npm install --save-dev babelify browserify` | Provides support for using ES6/7 features in the browser |
| SCSS | `npm install --save-dev node-sass` | Provides SCSS compilation |
| Javascript | `npm install --save-dev uglify-js` | Provides JS minificaiton |
| CSS | `npm install --save-dev clean-css autoprefixer` | Provides CSS minification and autoprefixing |
| SVG | `npm install --save-dev svgo` | Provides SVG optimization |

> {tip} Don’t worry if you forget to setup a dependency, Assets will let you know what to install if you try to use a compiler that doesn’t have it’s dependencies installed.

## Compilers vs Post Processors

Grind Assets is built around two types: **Compilers** and **Post Processors**.

**Compilers** run first, they’re used to compile (or transpile), files from a feature rich, high level languages such as SCSS or ES6 to a more primitive language that the browser supports, like CSS and Javascript.

**Post Processors** run last, they’re used for tasks such as minification and optimization.  Separating these tasks allows an SCSS compiler to focus on what it does best and then delegate tasks such as autoprefixing and minification to other tools that will also run on vanilla CSS files.

## File Matching
Most compilers and post processors match solely on file extension and don’t care where the file is located as long as it’s in `resources/assets`.

Example: as long as the file is called `main.scss`, the SCSS compiler will compile regardless of whether it’s located at `resources/assets/scss/main.scss` or `resources/assets/something-entirely-different/main.scss`.

#### Babel & ES6
The exception to this rule is Babel.  Since we need to distinguish ES6 from vanilla JS files, the Babel compiler has an additional rule to ensure it doesn’t attempt to transpile files it shouldn‘t.

All Babel files must be stored in a directory with “babel” in the path.  For example both: `resources/assets/babel/main.js` and `resources/assets/tooltip/babel/main.js` will be compiled by Babel, however, `resources/assets/tooltip/main.js` will not be.

## Basic Usage
Assets provides an `assetPath()` function that will look for your files in `resources/assets`, so the file referenced in the snippet below should be in `resources/assets/scss/site.scss`.

```stone
<link type="text/css" rel="stylesheet"
	href="{{ assetPath('scss/site.scss') }}" />
```

This works for any file type stored in `resource/assets`, including images:

```stone
<img src="{{ assetPath('img/icon.svg') }}" />
```

## Asset Containers
Assets ships with a full asset container system to integrate with views in simple and clean way.  The container system provides Nunjucks tags for `asset`, `style`, `script`, `scss`, `babel` and many more.

To use these tags, you must first configure your master layout to include them:

```stone
<!DOCTYPE html>
<html>
	<head>
		{{-- …head… --}}

		{{-- Renders included styles: --}}
		@asset('render', 'styles')
	</head>
	<body>
		{{-- …body… --}}

		{{-- Renders included scripts: --}}
		@asset('render', 'scripts')
	</body>
</html>
```

Once you’ve added those two lines to your master layout, you can begin using the view tags.

---

### Styles
Assets supports the following style-related view tags:

| Tag                  | Loads…                            |
| -------------------- | --------------------------------- |
| `style 'http://url'` | Any style path relative to `resources/assets` or an absolute URL |
| `css 'main'`         | `resources/assets/css/main.css`   |
| `scss 'main'`        | `resources/assets/scss/main.scss` |
| `sass 'main'`        | `resources/assets/scss/main.sass` |

The following tags are also supported, however Assets does not ship with compilers for them, so you’ll need to [write your own](#writing-your-own-compiler) if you wish to use them.  If you do, please submit a pull request to share with everyone else!

| Tag             | Loads…                              |
| --------------- | ----------------------------------- |
| `less 'main'`   | `resources/assets/less/main.less`   |
| `styl 'main'`   | `resources/assets/styl/styl.styl`   |
| `stylus 'main'` | `resources/assets/styl/main.stylus` |

---

### Scripts
Assets supports the following script-related view tags:

| Tag                   | Loads…                           |
| --------------------- | -------------------------------- |
| `script 'http://url'` | Any style script relative to `resources/assets` or an absolute URL |
| `js 'main'`           | `resources/assets/js/main.js`    |
| `babel 'main'`        | `resources/assets/babel/main.js` |

The following tags are also supported, however Assets does not ship with compilers for them, so you’ll need to [write your own](#writing-your-own-compiler) if you wish to use them.  If you do, please submit a pull request to share with everyone else!

| Tag                   | Loads…                                |
| --------------------- | ------------------------------------- |
| `coffee 'main'`       | `resources/assets/coffee/main.coffee` |


### Usage
Now that you’re familiar with the tags work, here’s an example of them in use:
```stone
@extends('layout.master')

@babel('welcome')
@scss('welcome')

@section('content')
	{{-- …some content… --}}
@endsection
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

## Building Your Own Compiler
Assets’ compilation system is fully extendable.

To build your own compiler, you must first extend the `Compiler` class from `grind-assets` and then implement the required methods:

```js
import { Compiler } from 'grind-assets'
import More from 'more-lang'

export class MoreCompiler extends Compiler {
	// List of supported extensions
	supportedExtensions = [ 'more', 'mcss' ]

	// The higher the value the more likely
	// it is to be treated as a match, should
	// two compilers want to match for the
	// same asset
	priority = 100

	compile(pathname) {
		return More.render(pathname)
	}

	mime() { return 'text/css' }
	type() { return 'css' }
	extension() { return 'css' }

}
```

Now create a new `AssetExtensionsProvider` to register the compiler:

```js
import 'App/Assets/MoreCompiler'

export function AssetExtensionsProvider(app) {
	app.assets.registerCompiler(MoreCompiler)
}
```

The only other thing you need to is register your new `AssetExtensionsProvider` in `app/Bootstrap.js` and your `.more` files should start being compiled.

For more information on what Compilers can do, check out the existing compilers in Grind’s source code: [github.com/grindjs/assets/tree/master/src/Compilers](https://github.com/grindjs/assets/tree/master/src/Compilers).

---

### Handling Imports

If your language supports imports, you’ll need to include a `enumerateImports` method in your Compiler to tell Assets about them.  This is used to correctly identify when files have changed:

```js
export class MoreCompiler extends Compiler {

	async enumerateImports(pathname, callback) {
		if(!(await FS.exists(pathname))) {
			return
		}

		const contents = await FS.readFile(pathname)
		const dirname = path.dirname(pathname)
		const importPaths = [ ]

		contents.toString().replace(/#import\s?([^\s]+);/ig, (_, importPath) => {
			importPaths.push(importPath)
		})

		for(let importPath of importPaths) {
			importPath = importPath.replace(/("|')/g, '').trim()
			importPath = path.join(dirname, importPath)

			if(!(await FS.exists(importPath))) {
				continue
			}

			await callback(file)
		}
	}

}
```

To see what this looks like in practice, check out the source for the built in [BabelCompiler](https://github.com/grindjs/assets/blob/master/src/Compilers/BabelCompiler.js#L60) and [ScssCompiler](https://github.com/grindjs/assets/blob/master/src/Compilers/ScssCompiler.js#L45)

## Building Your Own Post Processor
Assets’ post processor system is fully extendable.

To build your own post processor, you must first extend the `PostProcessor` class from `grind-assets` and then implement the required methods:

```js
import { PostProcessor } from 'grind-assets'
import PngCrusher from 'png-crusher'

export class PngPostProcessor extends PostProcessor {
	// List of supported extensions
	supportedExtensions = [ 'png' ]

	// The higher the value the more likely
	// it is to be treated as a match, should
	// two post processors want to match for
	// the same asset
	priority = 100

	process(sourcePath, targetPath, contents) {
		if(!this.shouldOptimize) {
			return Promise.resolve(contents)
		}

		return PngCrusher.crush(pathname)
	}

}
```

Now create a new `AssetExtensionsProvider` to register the compiler:

```js
import 'App/Assets/PngPostProcessor'

export function AssetExtensionsProvider(app) {
	app.assets.registerPostProcessor(PngPostProcessor)
}
```

The only other thing you need to is register your new `AssetExtensionsProvider` in `app/Bootstrap.js` and your PNGs should start being crushed.

For more information on what Post Processors can do, check out the existing post processors in Grind’s source code: [github.com/grindjs/assets/tree/master/src/PostProcessors](https://github.com/grindjs/assets/tree/master/src/PostProcessors).
