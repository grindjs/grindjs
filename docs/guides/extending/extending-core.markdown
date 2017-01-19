# Core Extensions
Most extensions to Grind should be done via [Providers](doc:providers), however there are several core classes that are created immediately upon instantiating Grind that need to be treated differently.

For these classes, you can pass in an object when creating an instance of `Grind` in `app/Boostrap.js`:
```js
import 'App/Errors/ErrorHandler'

const app = new Grind({
	errorHandlerClass: ErrorHandler
})
```

Grind will now use the provided `ErrorHandler` class instead of the default one it ships with.

Here’s a list of available overrides:

| Class Name | Constructor Key | Reference |
| ---------- | --------------- | --------- |
| Router | routerClass | [github.com/grindjs/framework/blob/master/src/Router.js](https://github.com/grindjs/framework/blob/master/src/Router.js) |
| ErrorHandler | errorHandlerClass | [github.com/grindjs/framework/blob/master/src/ErrorHandler.js](https://github.com/grindjs/framework/blob/master/src/ErrorHandler.js) |
| Config | configClass | [github.com/grindjs/framework/blob/master/src/Config.js](https://github.com/grindjs/framework/blob/master/src/Config.js) |
| UrlGenerator | urlGeneratorClass | [github.com/grindjs/framework/blob/master/src/UrlGenerator.js](https://github.com/grindjs/framework/blob/master/src/UrlGenerator.js) |
| Paths | pathsClass | [github.com/grindjs/framework/blob/master/src/Paths.js](https://github.com/grindjs/framework/blob/master/src/Paths.js) |

`grind-framework` exports all of the above classes for you to subclass and extend.

## Example
Here’s an example overriding the ErrorHandler class to report errors to a collector API:

```js
import { ErrorHandler as BaseErrorHandler } from 'grind-framework'
import 'request' from 'request-promise-native'

export class ErrorHandler extends BaseErrorHandler {

	report(req, res, err, info) {
		return request('https://host/report', {
			form: {
				info: info,
				stack: err.stack
			}
		})
	}

}
```
