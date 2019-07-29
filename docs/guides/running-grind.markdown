# Running Grind

[[toc]]

## Development

Your main entry point into Grind during dev time is the `watch` command:
```shell
bin/cli watch
```

This will start the server on whatever port specified in `config/app.json` (3000 by default), and monitor for changes in the `app` and `config` directories.

> {note} **Warning** Do **not** use `watch` in production as it will drastically slow your server down.

Grind leverages the the popular [chokidar](https://www.npmjs.com/package/chokidar) package to monitor changes in your `app` and `config` directories.  When a change is reported, Grind does the following:

1. Shuts down the HTTP server
2. Loops through node’s require cache and clears all entries related to the `app` directory
3. Starts the server again

By hot-reloading code, Grind is able to apply changes rapidly and get out of your way.

### What happens if there’s an error during restart?
Since `watch` is tightly integrated with Grind itself, if something goes wrong during startup such as a syntax error, it’s able to start a temporary HTTP server on the same port and bring you the error right in your browser:
![](https://assets.grind.rocks/docs/img/example-error.png)

> {note} Unfortunately `watch` is only able to surface errors in browsers during a _restart_ and not initial startup.  This is due to not knowing what port to start up on during initial boot.  Once it’s successfully booted the first time, it remembers the port and is able to server errors on it should something go wrong.

## Production
There's three extremely important rules to remember when running Grind in production:

1. Never use `watch`
2. Always remember to transpile via `bin/build`
3. Make sure `NODE_ENV` is set to `production` — this tells [Express](http://expressjs.com) to boot up in production mode, turning off certain debug features and otherwise tuning for production use.

There’s other things to know, but as long as you follow the aforementioned rules, you’ll be on the right track.

Actual deployment methods will differ depending on tools, but overall your deploy strategy should look something like this:
```shell
git pull production
bin/build
NODE_ENV=production build/bin/cli serve --cluster
```

### bin/build
Running `bin/build` will transpile through Babel right away, avoiding the overhead cost of doing some at runtime.

### build/bin/cli serve vs bin/cli serve
Be sure to run `build/bin/cli serve` once you’ve ran `bin/build` otherwise you’ll still be running through Babel, defeating the purpose of proactively transpiling.

### serve --cluster
Running with the `--cluster` flag is important, it let’s Grind start multiple servers (1 per CPU core) which will give you far greater performance at scale.
