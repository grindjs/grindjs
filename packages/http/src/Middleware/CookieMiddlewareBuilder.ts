import { Application, MissingPackageError } from '@grindjs/framework'

export function CookieMiddlewareBuilder(app: Application) {
	let cookieParser = null

	try {
		cookieParser = require('cookie-parser')
	} catch (err) {
		throw new MissingPackageError('cookie-parser')
	}

	const config: Record<string, any> = { ...app.config.get('cookie', {}) }
	const secret = config.secret || null
	delete config.secret

	return cookieParser(secret, config)
}
