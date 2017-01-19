---
title: "Providers"
excerpt: ""
---
Providers are the primary way to add functionality to Grind. Almost all of Grind’s own functionality is built on Providers, allowing you to pick and choose which you want, and even replace them entirely with something else.

Providers are registered in your app’s bootstrap file and are loaded during `app.boot()` which is triggered right before HTTP server starts listening or during CLI’s boot up.

Providers are loaded sequentially in the order they were registered (unless they have an explicit priority set, more below).
[block:api-header]
{
  "type": "basic",
  "title": "Building Your Own Providers"
}
[/block]
Building a provider couldn’t be easier, you just need a function that accepts a single `app` parameter:
[block:code]
{
  "codes": [
    {
      "code": "export function ViewExtensionProvider(app) {\n  app.view.share('appName', 'Hello World')\n}",
      "language": "javascript"
    }
  ]
}
[/block]
### Asynchronous Providers

Grind also supports providers that return promises, so if needed, you can perform asynchronous operations when your provider is booted:
[block:code]
{
  "codes": [
    {
      "code": "import fs from 'fs-promise'\n  \nexport function ViewExtensionProvider(app) {\n  return fs.readFile(app.paths.base('countries.json'), content => {\n\t  app.view.share('countries', JSON.parse(content)\n  })\n}",
      "language": "javascript"
    }
  ]
}
[/block]

[block:callout]
{
  "type": "info",
  "body": "Providers are loaded sequentially, regardless of wether or not they return a promise.  Be mindful of this when doing so, as the entire boot process will wait for your provider’s promise to finish resolving before moving on to the next provider and finishing the boot up."
}
[/block]

[block:api-header]
{
  "type": "basic",
  "title": "Registering Providers"
}
[/block]
Providers should be registered in `app/Bootstrap.js` via `app.providers.push`.  Here’s how we’d register our new `ViewExtensionProvider`:
[block:code]
{
  "codes": [
    {
      "code": "import Grind from 'grind-framework'\n  \nimport 'App/Providers/ViewExtensionProvider'\n\nconst app = new Grind()\napp.providers.push(ViewExtensionProvider)\n\nmodule.exports = app",
      "language": "javascript"
    }
  ]
}
[/block]

[block:api-header]
{
  "type": "basic",
  "title": "Provider Priority"
}
[/block]
By default, providers are loaded in the order in which they were registered, unless they have a priority explicitly set.

Provider priority is how we avoid loading one provider that depends on another after the provider it depends on is loaded, even if it’s registered before it.

Here’s a list of the priorities for Grind’s standard providers:
[block:parameters]
{
  "data": {
    "h-0": "Grind Provider",
    "h-1": "Priority",
    "0-0": "CliProvider",
    "0-1": "100000",
    "4-1": "40000",
    "4-0": "OrmProvider",
    "5-0": "ViewProvider",
    "5-1": "30000",
    "6-0": "HtmlProvider",
    "6-1": "20000",
    "7-0": "AssetsProvider",
    "7-1": "10000",
    "2-1": "50000",
    "2-0": "CacheProvider",
    "3-0": "DatabaseProvider",
    "3-1": "50000",
    "1-0": "QueueProvider",
    "1-1": "60000"
  },
  "cols": 2,
  "rows": 8
}
[/block]
In the previous `ViewExtensionProvider` example, since we haven’t explicitly set a priority, we can be assured that `ViewProvider` is loaded before it and `app.view` will already be resolved.

You set the priority of a provider by setting a `priority` property on the provider function:


[block:code]
{
  "codes": [
    {
      "code": "export function ViewExtensionProvider(app) {\n\t// …code…\n}\n\nViewExtensionProvider.priority = 100",
      "language": "javascript"
    }
  ]
}
[/block]
This sets the `ViewExtensionProvider` priority to 100, ensuring it’ll be loaded _after_ all of Grind’s standard providers, but _before_ any additional providers (such as RoutesProvider) your app provides.

### Implicit Priority

If you don’t explicitly set a priority value, Grind will assign a negative priority value based on the order in which it’s registered.  So the first provider without a priority will be assigned -1, the second -2, third -3, etc.
[block:api-header]
{
  "type": "basic",
  "title": "Extending Providers"
}
[/block]
If you need to extend a provider directly, you should write your own provider of the same name, then call the parent provider in yours:
[block:code]
{
  "codes": [
    {
      "code": "import {OrmProvider as BaseOrmProvider} from 'grind-orm'\n\nexport function OrmProvider(app) {\n  // Call the provider you’re extending first\n\tBaseOrmProvider(app)\n  \n  // Now add your additional logic\n}\n\n// Make sure you inherit the parent’s priority\nOrmProvider.priority = BaseOrmProvider.priority",
      "language": "javascript"
    }
  ]
}
[/block]

[block:api-header]
{
  "type": "basic",
  "title": "CLI Providers"
}
[/block]
The `CliProvider` and the `CommandsProvider` from your app are handled differently than most providers and are not  loaded in `app/Bootstrap.js`.  Instead they’re registered in `boot/Cli.js`.

This exception is for performance reasons, there’s no reason to incur the overhead of CLI providers and commands when you’re booting the HTTP server.

It’s important to keep this in mind when writing a provider that registers a CLI command, you’ll need to first make sure CLI exists:
[block:code]
{
  "codes": [
    {
      "code": "export function ThingProvider(app) {\n  app.thing = new Thing\n  \n  if(!app.cli) {\n    return\n  }\n  \n  app.cli.register(MakeThingCommand)\n}",
      "language": "javascript"
    }
  ]
}
[/block]