function expandDriverAlias(alias) {
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

export function Config(store, app) {
	if(typeof store === 'string') {
		store = app.config.get(`cache.stores.${store}`)
	}

	if(store.isNil) {
		return null
	}

	const driver = expandDriverAlias(store.driver || null)
	delete store.driver

	const config = Object.assign({ }, store)

	if(!config.path.isNil) {
		config.path = app.paths.base(config.path)
	}

	return {
		store: driver.isNil ? 'memory' : require(driver),
		options: config
	}
}
