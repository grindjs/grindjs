import { MissingPackageError } from 'grind-framework'

export function CompressionMiddlewareBuilder(app) {
	let compression = null

	try {
		compression = require('compression')
	} catch(err) {
		throw new MissingPackageError('compression')
	}

	return compression({ ...app.config.get('compression', { }) })
}
