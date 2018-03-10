import { MissingPackageError } from 'grind-framework'

export function MethodOverrideMiddlewareBuilder() {
	let methodOverride = null

	try {
		methodOverride = require('method-override')
	} catch(err) {
		throw new MissingPackageError('method-override')
	}

	return methodOverride('_method')
}
