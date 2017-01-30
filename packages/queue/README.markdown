# grind-queue

`grind-queue` is queue system built on [Kue](https://github.com/Automattic/kue) for simple integration with [Grind](https://github.com/grindjs/framework).

## Installation

Add `grind-queue` to your project:

```bash
npm install grind-queue --save
```

## Usage

To use `grind-queue` you’ll need to add it to your `Grind` providers:

```js
import Grind from 'grind-framework'
import {QueueProvider} from 'grind-queue'

const app = new Grind()
app.providers.push(QueueProvider)
```

From there, you can access the Queue via `app.queue`.

To learn more about how to use `grind-queue`, head over to the [Official Documentation](https://grind.rocks/docs/guides/queues).

## Config

`grind-queue` creates it’s Kue instance by leveraging `Grind`’s config system.  See [config/queue.json](config/queue.json) and the [Kue Documentation](https://github.com/Automattic/kue#redis-connection-settings) for full details.

You should place this in `config/queue.json` in your Grind project.

## CLI

`grind-queue` uses `grind-cli` for it’s CLI commands.  Run `bin/cli` in your project for a list of commands.
