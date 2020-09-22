# Directory Structure

The most important part of any application is a clear and concise directory structure. It doesn’t matter how great your code is if no one can find it!

Grind application’s are based on an MVC directory structure with a few additions (because we all use more than just models, views and controllers).

[[toc]]

## Basic Directory Structure

We’ll tackle each of these in more detail below, but here’s a quick overview of what your application’s directory structure will look like:

```
┌─ app
│  ├─ Commands
│  ├─ Controllers
│  ├─ Errors
│  ├─ Models
│  └─ Providers
├─ boot
├─ config
│  ├─ staging
│  └─ production
├─ database
│  ├─ migrations
│  └─ seeds
└─ storage
	 └─ cache
```

### Web Directory Structure

For web projects, Grind comes two different directory structures depending on the template you use. While uniformity is generally a goal of Grind, in this case the differences between how you build multipage and single page applications are substantial enough to offer a tailored experience to each.

> {tip} The directory structures for asset storage are only recommended defaults, head over to the [assets](assets) documentation to learn how to personalize your project.

#### Multipage Application Structure

```
┌─ public
└─ resources
   ├─ assets
   │  ├─ babel
   │  ├─ img
   │  └─ scss
   └── views
```

#### Single Page Application Structure

```
── public
   ├─ App
   ├─ Containers
   ├─ Errors
   ├─ Layouts
   └─ Static
```

## Boot Directory

The boot directory provides two entry points into Grind:

- `Cli.js` — Called by `yarn cli` and actually starts up the CLI
- `Http.js` — Called by `yarn cli serve` and `yarn cli watch` to start the HTTP server

## App Directory

The app directory is the core of your application, this is where the vast majority of your code lives.

- `Commands` — Contains all of your CLI commands.
- `Controllers` — Contains all of your Controllers.
- `Errors` — For web projects, you’ll find the `ErrorHandler` here that triggers [Ouch](https://www.npmjs.com/package/ouch) in development. This is also where you should store error classes.
- `Models` — Contains all of your Models.
- `Providers` — Contains all of your providers, including `RoutesProvider` which is where you should register all of your routes.

> {tip} [Grind Toolkit](installation#installing-grinds-toolkit) provides generators for many of these directories and file types. For example `grind make:model` will generate a model and store it in `app/Models`.

Run `grind --help` for a list of available generators (identified by the `make:` namespace).

## Config Directory

See the [Configuration guide](configuration) for a full overview of how files in the `config` directory are stored and processed.

## Multipage Applications

### Resources Directory

The resources directory is where all of your frontend code should go, from templates (views) to images, stylesheets and client side JavaScript. This directory is not included in API projects by default.

The `assets` directory is powered by the [Assets provider](assets). This is where all of your images, stylesheets and client side scripts will be stored. Be sure to read up on [Assets](assets) for a full breakdown on how this works.

The `views` directories is where you should store your [Stone](stone) templates. The [View provider](templates) will look for all of your views here.

### Public Directory

By default, Grind will do nothing with the `public` directory. When assets are published, AssetsProvider will register static servers for the `css`, `img`, `fonts` and `js` directories.

The expectation is that in production you’re running Grind behind a web server like nginx, which will handle serving out of `public` without ever hitting Grind.

If you’d like Grind to serve out of public itself, you can setup static middleware in your `RoutesProvider.js` file to do so:

```js
export function RoutesProvider(app) {
  app.routes.static('css', 'css')
  // The rest of your routes…
}
```

## Single Page Applications

By default, SPAs built on React through Grind’s [React template](https://github.com/grindjs/example-react) will move all asset management to the `public` directory. In convenentional SPA setups, assets like stylesheets are stored alongside components and the bulk of your application code will be in these same files. To better accomondate this, Grind optimizes asset management for SPAs by removing much of the directory structure for `resources` and flattening everything it into the `public` directory.

### Public Directory

As is the case in much of Grind, an opinionated directory structure is setup for use with Single Page Apps. While there’s absolutely no requirement to keep it in place, for new projects and developers simply figuring out where to place files in the React ecosystem can be overwhelming. Change and tweak away, but these are the sensible default’s we’ve arrived at:

#### App

The app directory contains the Bootstrap file to get things going as well global components, styles, helpers, etc that are used throughout your application.

#### Containers

Containers map to each section, or page, of your application. You’ll find the initial container component for the section and then a folder containing stylesheets and components for different areas of the section.

#### Errors

The error directory contains the global error boundary as well as error handlers that informs the boundary how to render each error. By default, support for “not found” (~[404](https://httpstatuses.com/404)) and “generic” (~[500](https://httpstatuses.com/500)) errors are included.

#### Layouts

Layouts are used in conjunection with routing setup to define the overall wrapper/header/footer of the part of the application you’re on.

### Resources Directory

While all of the heavy lifting is does in the [`public`](#public-directory), Grind maintains the `resource/views` structure from [Multipage Applications](#multipage-applications) for a single `root.stone` template that’s responsible for setting up the initial HTML that’s rendered to the browser.
