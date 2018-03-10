import { MissingPackageError } from 'grind-framework'

export function CookieMiddlewareBuilder(app) {
	let cookieParser = null

	try {
		cookieParser = require('cookie-parser')
	} catch(err) {
		throw new MissingPackageError('cookie-parser')
	}

	const config = { ...app.config.get('cookie', { }) }
	const secret = config.secret || null
	delete config.secret

	return cookieParser(secret, config)
}
