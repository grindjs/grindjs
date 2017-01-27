# Logging

[[toc]]

Grind provides a global `Log` class that should be used instead of `console.log`.  The Log class has 5 different logging methods/levels available:
```js
class Log {
	static info(...message) { }
	static comment(...message) { }
	static warn(...message) { }
	static error(...message) { }
	static success(...message) { }
}
```

## Default Logger
The default logger is `ChalkedConsoleLogger`.  This logger [chalks](https://www.npmjs.com/package/chalk) (colorizes) output before sending it to `console.log` to provide clear visual differentiation of log types:

* `Log.info` — Outputs default text color
* `Log.comment` — Outputs as blue text
* `Log.warn` — Outputs as yellow text
* `Log.error` — Outputs as white text with a red background
* `Log.success` — Output as green text

## Custom Logger
You can write your own custom logger by setting `Log.logger` to your own class with the same 5 method signatures.

Here’s an example of a logger that posts back to an API collector:
```js
import request from 'request'

export class CollectionLogger {

	info(...message) { this._notify('info', ...message) }
	comment(...message) { this._notify('comment', ...message) }
	warn(...message) { this._notify('warn', ...message) }
	error(...message) { this._notify('error', ...message) }
	success(...message) { this._notify('success', ...message) }

	_notify(level, ...message) {
		request('https://host/collect', {
			form: {
				level: level
				message: message.toString()
			}
		})
	}

}
```

To activate this logger, you should create a Logger [provider](providers):
```js
import 'App/Support/CollectionLogger'

export function LoggerProvider() {
	Log.logger = new CollectionLogger
}
```

From there, you just need to register `LoggerProvider` in your `app/Bootstrap.js` file and all existing `Log` calls will start posting to your collection handler instead of logging to the console.
