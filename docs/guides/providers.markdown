# Providers

Providers are the primary way to add functionality to Grind. Almost all of Grind’s own functionality is built on Providers, allowing you to pick and choose which you want, and even replace them entirely with something else.

Providers are registered in your app’s bootstrap file and are loaded during `app.boot()` which is triggered right before HTTP server starts listening or during CLI’s boot up.

Providers are loaded sequentially in the order they were registered (unless they have an explicit priority set, more below).

[[toc]]

## Building Your Own Providers

Building a provider couldn’t be easier, you just need a function that accepts a single `app` parameter:

```js
export function ViewExtensionProvider(app) {
  app.view.share('appName', 'Hello World')
}
```

### Asynchronous Providers

Grind also supports providers that return promises, so if needed, you can perform asynchronous operations when your provider is booted:

```js
import { FS } from 'grind-support'

export function ViewExtensionProvider(app) {
  return FS.readFile(app.paths.base('countries.json'), content => {
    app.view.share('countries', JSON.parse(content))
  })
}
```

> {note} Providers are loaded sequentially, regardless of wether or not they return a promise. Be mindful of this when doing so, as the entire boot process will wait for your provider’s promise to finish resolving before moving on to the next provider and finishing the boot up.

### Shutdown Handlers

If you’re building a provider that needs to clean up after itself on shutdown, such as closing connections, you can add a handler to the provider:

```js
export function StreamProvider(app) {
  app.stream = createSomeStream()
}

StreamProvider.shutdown = app => app.stream.close()
```

## Registering Providers

Providers should be registered in `app/Bootstrap.js` via `app.providers.push`. Here’s how we’d register our new `ViewExtensionProvider`:

```js
import Grind from 'grind-framework'

import 'App/Providers/ViewExtensionProvider'

const app = new Grind()
app.providers.push(ViewExtensionProvider)

module.exports = app
```

## Provider Priority

By default, providers are loaded in the order in which they were registered, unless they have a priority explicitly set.

Provider priority is how we avoid loading one provider that depends on another after the provider it depends on is loaded, even if it’s registered before it.

Here’s a list of the priorities for Grind’s standard providers:

| Grind Provider       | Priority |
| -------------------- | -------- |
| `CliProvider`        | 100000   |
| `DatabaseProvider`   | 70000    |
| `QueueProvider`      | 60000    |
| `CacheProvider`      | 50000    |
| `OrmProvider`        | 40000    |
| `RoutingProvider`    | 35000    |
| `ViewProvider`       | 30000    |
| `ValidationProvider` | 20000    |
| `HtmlProvider`       | 21000    |
| `AssetsProvider`     | 10000    |

In the previous `ViewExtensionProvider` example, since we haven’t explicitly set a priority, we can be assured that `ViewProvider` is loaded before it and `app.view` will already be resolved.

You set the priority of a provider by setting a `priority` property on the provider function:

```js
export function ViewExtensionProvider(app) {
  // …code…
}

ViewExtensionProvider.priority = 100
```

This sets the `ViewExtensionProvider` priority to 100, ensuring it’ll be loaded _after_ all of Grind’s standard providers, but _before_ any additional providers (such as RoutesProvider) your app provides.

---

### Implicit Priority

If you don’t explicitly set a priority value, Grind will assign a negative priority value based on the order in which it’s registered. So the first provider without a priority will be assigned -1, the second -2, third -3, etc.

## Extending Providers

If you need to extend a provider directly, you should write your own provider of the same name, then call the parent provider in yours:

```js
import { OrmProvider as BaseOrmProvider } from 'grind-orm'

export function OrmProvider(app) {
  // Call the provider you’re extending first
  BaseOrmProvider(app)

  // Now add your additional logic
}

// Make sure you inherit the parent’s priority and shutdown handler (if applicable)
OrmProvider.priority = BaseOrmProvider.priority
OrmProvider.shutdown = BaseOrmProvider.shutdown
```

## CLI Providers

The `CliProvider` and the `CommandsProvider` from your app are handled differently than most providers and are not loaded in `app/Bootstrap.js`. Instead they’re registered in `boot/Cli.js`.

This exception is for performance reasons, there’s no reason to incur the overhead of CLI providers and commands when you’re booting the HTTP server.

It’s important to keep this in mind when writing a provider that registers a CLI command, you’ll need to first make sure CLI exists:

```js
export function ThingProvider(app) {
  app.thing = new Thing()

  if (!app.cli) {
    return
  }

  app.cli.register(MakeThingCommand)
}
```
