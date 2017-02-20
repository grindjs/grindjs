import './Validator'
import './ValidationError'
import './ValidationErrorHandler'

export function ValidationProvider(app, validatorClass, validationErrorHandler) {
	validatorClass = validatorClass || Validator
	app.validator = new validatorClass(app, app.config.get('validation', { }))

	app.errorHandler.shouldntReport.push(ValidationError)
	app.errorHandler.register(ValidationError, validationErrorHandler || ValidationErrorHandler)
}

ValidationProvider.priority = 21000
