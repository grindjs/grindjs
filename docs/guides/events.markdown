# Events

The main `Grind` application class extends Node’s [EventEmitter](https://nodejs.org/api/events.html#events_class_eventemitter) and publishes several events you can use to extend and inject functionality into a Grind app.

[[toc]]

## boot

The `boot` event is published during the boot process just after all providers have been booted.

## router:boot

The `router:boot` event is published as part of the `Router.boot()` process.

This event is a good time to register any [Middleware Builders](routing#builders) or body parsers as it’ll be called before any routes are actually registered.

## listen

The `listen` event is right after an instance of [http.Server](https://nodejs.org/api/http.html#http_class_http_server) is created, but before `listen` is actually called on it.

The parameters passed to the `listen` event are the `Grind` application and the `http.Server` instance.

This event is a great place to setup things like WebSockets which will require access to the underlying `http.Server` instance.

## shutdown

The `shutdown` event is published during application shutdown and is a good time to clean up database connections, file watchers, and any other ongoing processes.
