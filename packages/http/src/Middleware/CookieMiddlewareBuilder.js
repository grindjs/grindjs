export function CookieMiddlewareBuilder(app) {
	let cookieParser = null

	try {
		cookieParser = require('cookie-parser')
	} catch(err) {
		throw new Error('cookie-parser missing, please run `npm install --save cookie-parser')
	}

	const config = { ...app.config.get('cookie', { }) }
	const secret = config.secret || null
	delete config.secret

	return cookieParser(secret, config)
}
