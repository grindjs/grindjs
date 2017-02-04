export function ConfigBuilder(store, app) {
	if(typeof store === 'string') {
		store = app.config.get(`cache.stores.${store}`)
	}

	if(store.isNil) {
		return null
	} else {
		store = { ...store }
	}

	const driver = expandDriverAlias(store.driver || null)
	delete store.driver

	return {
		store: driver.isNil ? 'memory' : require(driver),
		options: { ...expandStoreConfig(app, driver, store) }
	}
}

export function expandDriverAlias(alias) {
	if(alias.isNil) {
		return null
	}

	switch(alias.toLowerCase()) {
		case 'memcache':
		case 'memcached':
			return 'cache-manager-memcached-store'
		case 'redis':
			return 'cache-manager-redis'
		case 'mongo':
		case 'mongodb':
			return 'cache-manager-mongodb'
		case 'mongoose':
			return 'cache-manager-mongoose'
		case 'fs':
		case 'file':
		case 'files':
		case 'filesystem':
			return 'cache-manager-fs'
		case 'fs-binary':
			return 'cache-manager-fs-binary'
		case 'mem':
		case 'memory':
		case 'in-memory':
		case 'lru':
			return null
		default:
			return alias
	}
}

export function expandStoreConfig(app, driver, config) {
	if(!config.path.isNil) {
		config.path = app.paths.base(config.path)
	}

	if(driver !== 'cache-manager-redis' || config.connection === void 0) {
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
		return config
	}

	config = { ...config, ...connection }
	delete config.driver

	if(config.password !== void 0 && config.auth_pass === void 0) {
		config.auth_pass = config.password
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
