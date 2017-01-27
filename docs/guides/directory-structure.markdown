# Directory Structure
The most important part of any application is a clear and concise directory structure.  It doesn’t matter how great your code is if no one can find it!

Grind application’s are based on an MVC directory structure with a few additions (because we all use more than just models, views and controllers).

[[toc]]

## Basic Directory Structure
We’ll tackle each of these in more detail below, but here’s a quick overview of what your application’s directory structure will look like:

```
┌─ app
│  ├── Commands
│  ├── Controllers
│  ├── Errors
│  ├── Models
│  └── Providers
├─ bin
├─ boot
├─ config
│  ├── staging
│  └── production
├─ database
│  ├── migrations
│  └── seeds
├─ public
├─ resources
│  ├── assets
│  │  ├─── babel
│  │  ├─── img
│  │  └─── scss
│  └── views
└─ storage
	 └─ cache
```

## Bin & Boot Directories
The bin directory contains several binaries to assist you while building and running Grind:

* `build` — Transpile your app through Babel for use in Production
* `cli` — Your gateway into the [Grind CLI](cli), providing everything from code generators to running migrations.
* `lint` — Triggers `eslint` on your codebase, it’s important to keep things tidy!
* `serve` — Starts up the HTTP server
* `watch` — Starts the HTTP server and monitors for changes, for more information see [Running Grind](running-grind#development).

The boot directory provides two entry points into Grind:
* `Cli.js` — Called by `bin/cli` and actually starts up the CLI
* `Http.js` — Called by `bin/serve` and `bin/watch` to start the HTTP server

## App Directory
The app directory is the core of your application, this is where the vast majority of your code lives.

* `Commands` — Contains all of your CLI commands.
* `Controllers ` — Contains all of your Controllers.
* `Errors` — For web projects, you’ll find the `ErrorHandler` here that triggers [Ouch](https://www.npmjs.com/package/ouch) in development.  This is also where you should store error classes.
* `Models` — Contains all of your Models.
* `Providers` — Contains all of your providers, including `RoutesProvider` which is where you should register all of your routes.

> {tip} The cli provides generators for many of these directories and file types.  For example `bin/cli make:model` will generate a model and store it in `app/Models`.

Run `bin/cli --help` for a list of available generators (identified by the `make:` namespace).

## Config Directory
See the [Configuration guide](configuration) for a full overview of how files in the `config` directory are stored and processed.

## Resources Directory
The resources directory is where all of your frontend code should go, from templates (views) to images, stylesheets and client side JavaScript.  This directory is not included in API projects by default.

The `assets` directory is powered by the [Assets provider](assets).  This is where all of your images, stylesheets and client side scripts will be stored.  Be sure to read up on [Assets](assets) for a full breakdown on how this works.

The `views` directories is where you should store your [nunjucks](http://mozilla.github.io/nunjucks/) templates. The [View provider](templates) will look for all of your views here.

## Public Directory
By default, Grind will do nothing with the `public` directory.  When assets are published, AssetsProvider will register static servers for the `css`, `img`, `fonts` and `js` directories.

The expectation is that in production you’re running Grind behind a web server like nginx, which will handle serving out of `public` without ever hitting Grind.

If you’d like to Grind to serve out of public itself, you can setup static middleware in your `RoutesProvider.js` file to do so:
```js
export function RoutesProvider(app) {
	app.routes.static('css', 'css')
	// The rest of your routes…
}
```
