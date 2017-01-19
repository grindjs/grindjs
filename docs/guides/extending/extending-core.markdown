---
title: "Core Extensions"
excerpt: ""
---
Most extensions to Grind should be done via [Providers](doc:providers), however there are several core classes that are created immediately upon instantiating Grind that need to be treated differently.

For these classes, you can pass in an object when creating an instance of `Grind` in `app/Boostrap.js`:
[block:code]
{
  "codes": [
    {
      "code": "import 'App/Errors/ErrorHandler'\n\nconst app = new Grind({\n\terrorHandlerClass: ErrorHandler\n})",
      "language": "javascript"
    }
  ]
}
[/block]
Grind will now use the provided `ErrorHandler` class instead of the default one it ships with.

Here's a list of available overrides:
[block:parameters]
{
  "data": {
    "h-0": "Class Name",
    "h-1": "Constructor Key",
    "h-2": "Reference",
    "0-0": "Router",
    "0-1": "routerClass",
    "1-0": "ErrorHandler",
    "1-1": "errorHandlerClass",
    "2-0": "Config",
    "2-1": "configClass",
    "3-0": "UrlGenerator",
    "3-1": "urlGeneratorClass",
    "4-0": "Paths",
    "4-1": "pathsClass",
    "h-3": "Reference",
    "1-3": "",
    "0-3": "",
    "2-3": "",
    "3-3": "",
    "4-3": "",
    "1-2": "[github.com/grindjs/framework/blob/master/src/ErrorHandler.js](https://github.com/grindjs/framework/blob/master/src/ErrorHandler.js)",
    "0-2": "[github.com/grindjs/framework/blob/master/src/Router.js](https://github.com/grindjs/framework/blob/master/src/Router.js)",
    "2-2": "[github.com/grindjs/framework/blob/master/src/Config.js](https://github.com/grindjs/framework/blob/master/src/Config.js)",
    "3-2": "[github.com/grindjs/framework/blob/master/src/UrlGenerator.js](https://github.com/grindjs/framework/blob/master/src/UrlGenerator.js)",
    "4-2": "[github.com/grindjs/framework/blob/master/src/Paths.js](https://github.com/grindjs/framework/blob/master/src/Paths.js)"
  },
  "cols": 3,
  "rows": 5
}
[/block]
`grind-framework` exports all of the above classes for you to subclass and extend.
[block:api-header]
{
  "type": "basic",
  "title": "Example"
}
[/block]
Here’s an example overriding the ErrorHandler class to report errors to a collector API:
[block:code]
{
  "codes": [
    {
      "code": "import {ErrorHandler as BaseErrorHandler} from 'grind-framework'\nimport 'request' from 'request-promise-native'\n\nexport class ErrorHandler extends BaseErrorHandler {\n\n\treport(req, res, err, info) {\n\t\treturn request('http://host/report', {\n\t\t\tform: {\n\t\t\t\tinfo: info,\n\t\t\t\tstack: err.stack\n\t\t\t}\n\t\t})\n\t}\n\n}",
      "language": "javascript",
      "name": "ErrorHandler.js"
    }
  ]
}
[/block]