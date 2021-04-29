import { Application, MissingPackageError } from '@grindjs/framework'

export function CompressionMiddlewareBuilder(app: Application) {
	let compression = null

	try {
		compression = require('compression')
	} catch (err) {
		throw new MissingPackageError('compression')
	}

	return compression({ ...app.config.get('compression', {}) })
}
