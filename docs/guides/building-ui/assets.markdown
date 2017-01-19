---
title: "Assets"
excerpt: ""
---
Assets provides a simple way to work with assets within Grind.  It’s designed to get out of your way and allow you to work without worrying about running a watch command and waiting for files to compile.  Once setup, all you need to do is store your assets in `/resources/assets` and the package will automatically detect changes and compile (and cache) on page load.

In production environments, be sure to run the `assets:publish` command so all assets are precompiled and moved to the public directory, allowing your web server to more effeciently serve them.

### Installing dependencies

Assets comes with built in support for a bunch of asset types, but to maintain flexibility and minimize node_modules bloat, it doesn’t explicitly require any compiler depenencies.  Instead you can pick and choose which you want to use, and install them directly.

Refer to the table below determine which dependencies you’ll need:
[block:parameters]
{
  "data": {
    "h-0": "Compiler",
    "h-1": "Install Command",
    "0-0": "Babel",
    "1-0": "SCSS",
    "2-0": "Javascript",
    "3-0": "CSS",
    "4-0": "SVG",
    "4-1": "`npm install --save-dev svgo`",
    "3-1": "`npm install --save-dev clean-css`",
    "2-1": "`npm install --save-dev uglify-js`",
    "1-1": "`npm install --save-dev node-sass`",
    "0-1": "`npm install --save-dev babelify browserify`",
    "h-2": "Description",
    "0-2": "Provides support for using ES6/7 features in the browser",
    "1-2": "Provides SCSS compilation",
    "2-2": "Provides JS minificaiton",
    "3-2": "Provides CSS minification",
    "4-2": "Provides SVG optimization"
  },
  "cols": 3,
  "rows": 5
}
[/block]

[block:callout]
{
  "type": "info",
  "body": "Don’t worry if you forget to setup a dependency, Assets will let you know what to install if you try to use a compiler that doesn’t have it’s dependencies installed."
}
[/block]
### Directories & Babel

Most compilers match solely on file extension and don’t care where the file is located as long as it’s in `/resources/assets`.  As an example, as long as the file is called `main.scss`, the SCSS compiler will compile regardless of whether it’s located at `/resources/assets/scss/main.scss` or `/resources/assets/something-entirely-different/main.scss`.

The exception to this rule is Babel.  Since we want to minify plain old JS files, the Babel compiler has an additional rule to ensure it doesn’t conflict with the JS minifier.  All Babel files must be stored in a directory with “babel” in the path.  For example both: `/resources/assets/babel/main.js` and `/resources/assets/tooltip/babel/main.js` will be compiled by Babel, however, `/resources/assets/tooltip/main.js` would not be.
[block:api-header]
{
  "type": "basic",
  "title": "Simple Usage"
}
[/block]
Assets provides an `assetPath()` function that will look for your files in `/resources/assets`, so the file referenced in the snippet below should be in `/resources/assets/scss/site.scss`.
[block:code]
{
  "codes": [
    {
      "code": "<link type=\"text/css\" rel=\"stylesheet\" href=\"{{ assetPath('scss/site.scss') }}\" />",
      "language": "jinja2"
    }
  ]
}
[/block]

[block:api-header]
{
  "type": "basic",
  "title": "Advanced Usage"
}
[/block]
Assets also ships with a full asset container system to drop into views in a much cleaner way.  It provides tags for `asset`, `style`, `script`, `scss`, `babel` and many more.

To use these tags, you must first configure your master layout to include them:
[block:code]
{
  "codes": [
    {
      "code": "<!DOCTYPE html>\n<html>\n\t<head>\n  \t{# …head… #}\n\t\t{% asset 'render', 'styles' %} {# <-- Renders included styles #}\n\t</head>\n\t<body>\n  \t{# …body… #}\n\t\t{% asset 'render', 'scripts' %} {# <-- Renders included scripts #}\n\t</body>\n</html>\n",
      "language": "jinja2",
      "name": "master.njk"
    }
  ]
}
[/block]
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
[block:code]
{
  "codes": [
    {
      "code": "{% extends 'layout/master.njk' %}\n\n{% babel 'welcome' %}\n{% scss 'welcome' %}\n\n{% block content %}\n\t{# …some content… #}\n{% endblock %}\n",
      "language": "jinja2",
      "name": "welcome.js"
    }
  ]
}
[/block]
When this view renders, it will load look something like this:
[block:code]
{
  "codes": [
    {
      "code": "<!DOCTYPE html>\n<html>\n\t<head>\n\t\t<!-- …head… -->\n\t\t<link media=\"all\" type=\"text/css\" rel=\"stylesheet\" href=\"http://localhost:3100/assets/scss/welcome.scss\">\n\t</head>\n\t<body>\n\t\t<!-- …body… -->\n\t\t<script src=\"http://localhost:3100/assets/babel/app.js\"></script>\n\t</body>\n</html>",
      "language": "html"
    }
  ]
}
[/block]

[block:api-header]
{
  "type": "basic",
  "title": "Deployments"
}
[/block]
During your deploy process, you should run `bin/cli assets:publish`.  This will precompile all assets and move them into the `public/` directory.

As long as you’re using `assetPath()` or one of the asset container tags to reference your assets, they’ll start serving the compiled versions automatically.
[block:api-header]
{
  "type": "basic",
  "title": "Writing Your Own Compiler"
}
[/block]
Assets’ compilation system is fully extendable.

To write your own compiler, you must first extend the `Compiler` class from `grind-assets` and then implement the required methods:
[block:code]
{
  "codes": [
    {
      "code": "import {Compiler} from 'grind-assets'\nimport PngCrusher from 'png-crusher'\nimport fs from 'fs-promise'\n\nexport class PngCompiler extends Compiler {\n\t// List of supported extensions\n\tsupportedExtensions = [ 'png' ]\n\n\t// The higher the value the more likely\n  // it is to be treated as a match, should\n  // two compilers want match for the same asset\n\tpriority = 100\n\n\tcompile(pathname, context) {\n\t\tif(!this.autoMinify) {\n\t\t\treturn fs.readFile(pathname)\n\t\t}\n\n\t\treturn PngCrusher.crush(pathname)\n\t}\n\n\tmime() { return 'image/png' }\n\ttype() { return 'img' }\n\textension() { return 'png' }\n\n}",
      "language": "javascript",
      "name": "PngCompiler.js"
    }
  ]
}
[/block]
Now create a new `AssetCompilersProvider` to register the compiler:
[block:code]
{
  "codes": [
    {
      "code": "import 'App/Assets/PngCompiler'\n\nexport function AssetCompilersProvider(app) {\n\tapp.assets.registerCompiler(PngCompiler)\n}",
      "language": "javascript"
    }
  ]
}
[/block]
The only other thing you need to is register your new `AssetCompilersProvider` in `app/Bootstrap.js` and your PNGs should start being crushed.

For more information on what Compilers can do, check out the existing compilers in Grind’s source code: [github.com/grindjs/assets/tree/master/src/Compilers](https://github.com/grindjs/assets/tree/master/src/Compilers).