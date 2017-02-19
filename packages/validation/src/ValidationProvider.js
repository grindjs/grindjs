import './Validator'

export function ValidationProvider(app, validatorClass) {
	validatorClass = validatorClass || Validator
	app.validator = new validatorClass(app, app.config.get('validation', { }))
}

ValidationProvider.priority = 21000
