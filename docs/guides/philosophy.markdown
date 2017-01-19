# Philosophy
The philosophy behind Grind is simple: provide a fast, easy to use framework while avoiding reinventing the wheel wherever possible (aside from, you know, building yet another framework).

## Built on Community Favorites
You can find a lot of well tested and highly used packages on NPM, but tracking them down and integrating them into your app in a cohesive manner without things feeling fragmented gets to be tiresome and difficult.

Grind is built on [Express](http://expressjs.com), and while Express is all about being “unopinionated”, Grind very much as an opinion.  It provides you with an clear, defined structure for building your app, integrating with different packages, loading routes, config, etc…

Outside of Express, Grind leverages popular NPM packages from [Commander](http://npmjs.com/package/commander) for CLI, [Objection.js](https://www.npmjs.com/package/objection) for ORM, to [Nunjucks](https://www.npmjs.com/package/nunjucks) for templating; allowing you to get the benefits of a framework without worrying about whether or not Grind’s DBA library is up to par — you already know that [Knex](https://www.npmjs.com/package/knex) is.

## Customizable
Grind has no interest in forcing vendor lock in with it’s own packages.  While we think we chose well, if you decide you’d rather use [sequelize](https://www.npmjs.com/package/sequelize) over Objection.js, go for it!  Grind won’t tie you to anything, it’s highly extensible and swapping out components via it’s [Provider system](providers) is a breeze.

## Performance is Everything
While Grind wants to provide you with a structured framework, it absolutely does _not_ want you to incur lots of overhead for it.  Grind shifts as much as possible to boot time configuration to avoid costs at runtime every time a request is processed.  A good example of this is Grind’s interaction with Express.  Grind extends Express’s routing in a number of ways, but it does so all during boot time so while you as a developer have powerful routing, once Grind is booted and requests are being served the performance is about the same as if you wrote it all out by hand in pure Express.

## Forward Thinking
Grind makes heavy use of the Babel transpiler to build for the future, rather than being tied down by what Node/V8 can do right now.  As Node/V8 continue to grow, we’ll periodically update our Babel settings to reduce the number of transpilers necessary.  For now, we’re committed to supporting Node v5 as our base target until v6 officially hits LTS.
