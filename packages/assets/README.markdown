# grind-assets

`grind-assets` provides a simple way to work with assets within [Grind](https://github.com/grindjs/framework).  It’s designed to get out of your way and allow you to work without worrying about running a watch command and waiting for files to compile.  Once setup, all you need to do is store your assets in `/resources/assets` and the package will automatically detect changes and compile (and cache) on page load.

In production environments, be sure to run the `assets:publish` command so all assets are precompiled and moved to the public directory, allowing your your web server to more effeciently serve them.

## Installation

##### Install via NPM

```bash
npm install --save grind-assets
```

##### Setup the provider in `app/Bootstrap.js`

```js
import Grind from 'grind-framework'
import {AssetsProvider} from 'grind-assets'

const app = new Grind()
app.providers.push(AssetsProvider)
```

___NOTE:___ If you’re also using `grind-html` and `grind-view`, make sure `AssetsProvider` is added _after_ `ViewProvider` and `HtmlProvider`.

##### *(Optional)* Update your `.gitignore` files to ignore published assets

All of your assets should live in `/resources/assets`, so it’s a good idea to update your `.gitignore` to make sure published assets don’t accidentally make their way into git.

```bash
echo "assets-published.json" >> config/.gitignore
echo "css/" >> public/.gitignore
echo "img/" >> public/.gitignore
echo "js/" >> public/.gitignore
echo "font/" >> public/.gitignore
```

##### Installing other dependencies

`grind-assets` comes with built in support for a bunch of asset types, but to maintain flexibility and minimize node_modules bloat, it doesn’t explicitly require any compiler depenencies.  Instead you can pick and choose which you want to use, and install them directly.

Refer to the table below determine which dependencies you’ll need:

| Compiler      | Install Command                                              |
| ------------- | ------------------------------------------------------------ |
| Babel         | `npm install --save-dev babelify browserify`                 |
| SCSS          | `npm install --save-dev node-sass`                           |
| Javascript    | `npm install --save-dev uglify-js`                           |
| CSS           | `npm install --save-dev clean-css`                           |
| SVG           | `npm install --save-dev svgo`                                |

Don’t worry if you forget to setup a dependency, `grind-assets` will let you know what to install if you try to use a compiler that doesn’t have it’s dependencies installed.

## Usage

##### Include your assets in templates via the `assetPath()` function

`assetPath()` will look for your files in `/resources/assets`, so the file referenced in the snippet below should be in `/resources/assets/scss/site.scss`.

```twig
<link type="text/css" rel="stylesheet" href="{{ assetPath('scss/site.scss') }}" />
```

Now refresh the page to make sure your file was included and properly compiled.

##### On deploy, run `bin/cli assets:publish`

This will pre-compile all assets and move them into the `public/` directory.  As long as you’re using `assetPath()` to reference your assets, they’ll start serving the compiled versions.
