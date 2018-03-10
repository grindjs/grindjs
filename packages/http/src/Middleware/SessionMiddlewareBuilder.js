import { MissingPackageError } from 'grind-framework'

import '../Session/StoreConfigBuilder'

export function SessionMiddlewareBuilder(app) {
	let session = null

	try {
		session = require('express-session')
	} catch(err) {
		throw new MissingPackageError('express-session')
	}

	const config = { ...app.config.get('session', { }) }
	const storeConfig = StoreConfigBuilder(config.default, app)

	if(storeConfig.isNil) {
		throw new Error('Invalid session config')
	} else if(storeConfig.store !== 'memory') {
		config.store = new storeConfig.store(storeConfig.options)
	} else if(app.env() === 'production') {
		Log.error('WARNING: Using memory sessions in production is not supported.')
	}

	delete config.stores
	delete config.default

	if(config.saveUninitialized === void 0) {
		config.saveUninitialized = true
	}

	if(config.resave === void 0) {
		config.resave = false
	}

	config.cookie = { ...app.config.get('cookie'), ...(config.cookie || { }) }
	config.secret = config.cookie.secret
	config.name = config.cookie.name || 'grind-session'
	delete config.cookie.name

	const middleware = {
		session: session(config)
	}

	if(process.env.NODE_ENV === 'test') {
		middleware.session.__store = config.store
	}

	if(config.flash !== false) {
		let flash = null

		try {
			flash = require('express-flash')
		} catch(err) {
			throw new MissingPackageError('express-flash')
		}

		middleware.flash = flash()
	}

	delete config.flash

	return middleware
}
