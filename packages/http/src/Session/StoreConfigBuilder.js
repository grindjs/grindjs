import { MissingPackageError } from 'grind-framework'

export function StoreConfigBuilder(store, app, returnStoreName = false) {
	let session = null

	try {
		session = require('express-session')
	} catch(err) {
		throw new MissingPackageError('express-session')
	}

	if(typeof store === 'string') {
		store = app.config.get(`session.stores.${store}`)
	}

	if(store.isNil) {
		throw new Error('Invalid store')
	} else {
		store = { ...store }
	}

	const driver = expandDriverAlias(store.driver || null)
	delete store.driver

	if(driver.isNil) {
		throw new Error('Invalid store driver')
	}

	const result = {
		options: { ...expandStoreConfig(app, driver, store) }
	}


	if(returnStoreName || driver === 'memory') {
		result.store = driver
	} else if(driver === 'database') {
		result.store = require('./DatabaseStore.js').DatabaseStore
	} else {
		try {
			result.store = require(driver)(session)
		} catch(err) {
			throw new Error(`${driver} missing, please run \`npm install --save ${driver}\``)
		}
	}

	return result
}

export function expandDriverAlias(alias) {
	if(alias.isNil) {
		return null
	}

	switch(alias.toLowerCase()) {
		case 'db':
		case 'database':
		case 'knex':
			return 'database'
		case 'memcache':
		case 'memcached':
			return 'connect-memcached'
		case 'redis':
			return 'connect-redis'
		case 'mongo':
		case 'mongodb':
			return 'connect-mongodb-session'
		case 'fs':
		case 'file':
		case 'files':
		case 'filesystem':
			return 'session-file-store'
		case 'mem':
		case 'memory':
		case 'in-memory':
			return 'memory'
		default:
			return alias
	}
}

export function expandStoreConfig(app, driver, config) {
	switch(driver) {
		case 'connect-redis':
			return expandRedisStoreConfig(app, driver, config)
		case 'database':
			return expandDatabaseStoreConfig(app, driver, config)
		case 'session-file-store':
			return expandFileStoreConfig(app, driver, config)
	}

	return config
}

function expandRedisStoreConfig(app, driver, config) {
	if(config.connection === void 0) {
		return config
	}

	let connection = config.connection
	delete config.connection

	if(connection === null) {
		connection = app.config.get('redis.default', null)
	}

	if(typeof connection === 'string') {
		connection = app.config.get(`redis.connections.${connection}`)
	}

	if(connection.isNil) {
		throw new Error('Invalid redis connection in session')
	}

	config = { ...config, ...connection }
	delete config.driver

	if(config.password !== void 0 && config.pass === void 0) {
		config.pass = config.password
		delete config.password
	}

	if(config.host === void 0) {
		config.host = 'localhost'
	}

	if(config.port === void 0) {
		config.port = 6379
	}

	return config
}

function expandDatabaseStoreConfig(app, driver, config) {
	if(config.connection === void 0) {
		return config
	}

	let connection = config.connection
	delete config.connection

	if(connection === null) {
		connection = app.db
	} else {
		if(typeof connection === 'string') {
			connection = app.config.get(`database.connections.${connection}`)
		}

		if(typeof connection === 'object') {
			const DatabaseBuilder = require('grind-db').DatabaseBuilder
			connection = DatabaseBuilder({ ...connection }, app)
		} else {
			connection = null
		}
	}

	if(connection.isNil) {
		throw new Error('Invalid database connection in session')
	}

	config.connection = connection
	delete config.driver

	return { app, ...config }
}

function expandFileStoreConfig(app, driver, config) {
	if(config.path === void 0) {
		config.path = app.paths.base('resources/sessions')
	} else {
		config.path = require('path').resolve(app.paths.base(), config.path)
	}

	return config
}
