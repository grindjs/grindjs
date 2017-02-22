# Validation
Grind’s [Validation provider](https://github.com/grindjs/validation) leverages the popular [Joi](https://www.npmjs.com/package/joi) validation package behind the scenes to provide you an extensive validation suite with a simple and easy to use API that feels right at home in your Grind application.

[[toc]]

## Installation
First, add the `grind-validation` package via your preferred package manager:

```shell
npm install --save grind-validation
```

Next, you’ll need to add `ValidationProvider` to your app providers in `app/Boostrap.js`:

```js
import Grind from 'grind-framework'
import { ValidationProvider } from 'grind-db'

const app = new Grind()
app.providers.push(DatabaseProvider)
```

## Basic Validation
To validate a request, just pass the body to `validate`, define your rules and you’re good to go:

```js
async store(req, res) {
	await this.app.validator.validate(req.body, rule => {
		username: rule.string().min(3).max(10)
	})

	return res.send('Success')
}
```

_That’s it_.  If there’s any validation errors, the validator will throw a `ValidationError` that you can catch for advanced handling, if you‘d like.  By default, Validation sets up a custom error handler for `ValidationError`:

* For XHR/JSON requests, the error handler will return a 400 status code and an error payload that includes the violations.
* For other requests, the error handler will flash the errors, flash the current input and redirect back to the original request.  If you‘re using [FormBuilder](html-builders), when redirected back to the original page, the forms will already be prefilled with the previous input.

## Available Rules
For a comprehensive list of rules you can use, check out the detailed [Joi documentation](https://github.com/hapijs/joi/blob/master/API.md).

### Prebuilding Rules
For performance purposes, you may want to prebuild the rules ahead of time and then reuse them in each validation call.  This is easy to do via the `build` method:

```js
const rules = this.app.validator.build(rule => {
	username: rule.string().min(3).max(10)
})

await this.app.validator.validate(req.body, rules)
```

### Custom Rules
Grind exposes an easy way to define custom rules via the `extend` method.

```js
extend(name, type, options, validator)
```

###### Parameters

* `name`: This is the name of your rule that you’ll call later when using it.
* `type`: _(optional)_ The data type for your rule, valid values are: `any`, `array`, `boolean`, `binary`, `date`, `number`, `object` and `string`.  If you don’t provide the parameter, it will default to `any`.
* `options`: _(optional)_ The options parameter are raw [Joi options](https://github.com/hapijs/joi/blob/master/API.md#extension) you can use to customize if necessary.
* `validator`: This is the callback parameter used to validate the value.  It’s passed the following parameters:
	* `value`: The value to validate
	* `params`: Any parameters passed to your rule
	* `context`: The current rule object

###### Example

```js
export function ValidationRulesProvider(app) {
	app.validator.extend('test', 'string', value => {
		if(value !== 'test') {
			throw new Error('invalid test value')
		}

		return value
	})
}
```

Once your rule is defined, you can start using it just like any other rule:

```js
await this.app.validator.validate(req.body, rule => {
	username: rule.string().min(3).max(10),
	someField: rule.string().test()
})
```


## Displaying Errors

Errors are automatically exposed to your [Views](templates) via `messages.errors`.  Here‘s an example of how to display errors in a simple list:

```njk
{% if messages and messages.errors and messages.errors.length > 0 %}
	<ul class="errors">
		{% for field, errors in messages.errors[0] %}
			{% for error in errors %}
				<li class="error">{{ error.message }}</li>
			{% endfor %}
		{% endfor %}
	</ul>
{% endif %}
```
