---
title: "Logging"
excerpt: ""
---
Grind provides a global `Log` class that should be used instead of `console.log`.  The Log class has 5 different logging methods/levels available:
[block:code]
{
  "codes": [
    {
      "code": "class Log {\n\tstatic info(...message) { }\n\tstatic comment(...message) { }\n\tstatic warn(...message) { }\n\tstatic error(...message) { }\n\tstatic success(...message) { }\n}",
      "language": "javascript"
    }
  ]
}
[/block]

[block:api-header]
{
  "type": "basic",
  "title": "Default Logger"
}
[/block]
The default logger is `ChalkedConsoleLogger`.  This logger [chalks](https://www.npmjs.com/package/chalk) (colorizes) output before sending it to `console.log` to provide clear visual differentiation of log types:

* `Log.info` — Outputs default text color
* `Log.comment` — Outputs as blue text
* `Log.warn` — Outputs as yellow text
* `Log.error` — Outputs as white text with a red background
* `Log.success` — Output as green text
[block:api-header]
{
  "type": "basic",
  "title": "Custom Logger"
}
[/block]
You can write your own custom logger by setting `Log.logger` to your own class with the same 5 method signatures.

Here’s an example of a logger that posts back to an API collector:
[block:code]
{
  "codes": [
    {
      "code": "import request from 'request'\n\nexport class CollectionLogger {\n\n\tinfo(...message) { this._notify('info', ...message) }\n\tcomment(...message) { this._notify('comment', ...message) }\n\twarn(...message) { this._notify('warn', ...message) }\n\terror(...message) { this._notify('error', ...message) }\n\tsuccess(...message) { this._notify('success', ...message) }\n\n\t_notify(level, ...message) {\n\t\trequest('http://host/collect', {\n\t\t\tform: {\n\t\t\t\tlevel: level\n\t\t\t\tmessage: message.toString()\n\t\t\t}\n\t\t})\n\t}\n\n}",
      "language": "javascript",
      "name": "CollectionLogger.js"
    }
  ]
}
[/block]
To activate this logger, you should create a Logger [provider](doc:providers):
[block:code]
{
  "codes": [
    {
      "code": "import 'App/Support/CollectionLogger'\n\nexport function LoggerProvider() {\n\tLog.logger = new CollectionLogger\n}",
      "language": "javascript",
      "name": "LoggerProvider.js"
    }
  ]
}
[/block]
From there, you just need to register `LoggerProvider` in your `app/Bootstrap.js` file and all existing `Log` calls will start posting to your collection handler instead of logging to the console.