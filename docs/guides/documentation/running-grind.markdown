---
title: "Running Grind"
excerpt: ""
---
[block:api-header]
{
  "type": "basic",
  "title": "Development"
}
[/block]
Grind provides an easy to use `watch` bin for you to use during development:
[block:code]
{
  "codes": [
    {
      "code": "bin/watch",
      "language": "shell"
    }
  ]
}
[/block]
This will start the server on whatever port specified in `config/app.json` (3000 by default), and monitor for changes in the `app` and `config` directories.
[block:callout]
{
  "type": "warning",
  "title": "bin/watch is not safe for production use",
  "body": ""
}
[/block]
Grind does *not* make use of [nodemon](http://nodemon.io) to handle monitoring.  While nodemon is great to start, completely restarting your app on every single file change is dreadfully slow.

Instead, Grind supports monitoring directly.  It uses the popular [chokidar](https://www.npmjs.com/package/chokidar) package to monitor changes in your `app` and `config` directories.  When a change is reported, Grind does the following:

1. Shuts down the HTTP server
2. Loops through node’s require cache and clears all entries related to the `app` directory
3. Starts the server again

### How does this differ from nodemon?

When nodemon detects a file change, it stops your entire application and then starts it again.  This means that all existing require cache for all node dependencies are thrown out and need to be reloaded.  This can be excruciatingly slow the larger your project gets, but even on a small project it can take between 1 to 2 seconds for the server to start responding again (which may not seem like a lot, but it becomes frustrating).

Grind’s method, on the other hand, maintains all existing cache so the only files being reloaded/reprocessed by node are the app’s files.  This results in a near instant restart process that by the time you’ve switched to your browser and refreshed, the server has already restarted and is running your latest changes.

### What happens if there’s an error during restart?

Since `bin/watch` is tightly integrated with Grind itself, if something goes wrong during startup such as a syntax error, it’s able to start a temporary HTTP server on the same port and bring you the error right in your browser:
[block:image]
{
  "images": [
    {
      "image": [
        "https://files.readme.io/930d272-Screen_Shot_2016-08-12_at_11.48.20_PM.png",
        "Screen Shot 2016-08-12 at 11.48.20 PM.png",
        1326,
        688,
        "#e8e6e6"
      ]
    }
  ]
}
[/block]

[block:callout]
{
  "type": "info",
  "body": "Unfortunately `bin/watch` is only able to surface errors in browsers during a _restart_ and not initial startup.  This is due to not knowing what port to start up on during initial boot.  Once it’s successfully booted the first time, it remembers the port and is able to server errors on it should something go wrong."
}
[/block]

[block:api-header]
{
  "type": "basic",
  "title": "Production"
}
[/block]
There's three extremely important rules to remember when running Grind in production:

1. Never use `bin/watch`
2. Always remember to transpile via `bin/build`
3. Make sure `NODE_ENV` is set to `production` -- this tells [Express](http://expressjs.com) to boot up in production mode, turning off certain debug features and otherwise tuning for production use.

There’s other things to know, but as long as you follow the aforementioned rules, you’ll be on the right track.

Actual deployment methods will differ depending on tools, but overall your deploy strategy should look something like this:
[block:code]
{
  "codes": [
    {
      "code": "git pull production\nbin/build\nNODE_ENV=production build/bin/serve --cluster",
      "language": "shell"
    }
  ]
}
[/block]
### bin/build
Running `bin/build` will transpile through Babel right away, avoiding the overhead cost of doing some at runtime.

### build/bin/serve vs bin/serve
Be sure to run `build/bin/serve` once you’ve ran `bin/build` otherwise you’ll still be running through Babel, defeating the purpose of proactively transpiling.

### serve --cluster
Running with the `--cluster` flag is important, it let’s Grind start multiple servers (1 per CPU core) which will give you far greater performance at scale.