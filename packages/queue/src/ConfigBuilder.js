export function ConfigBuilder(config, app) {
	if(config.isNil) {
		config = app.config.get('queue.default')
	}

	if(typeof config === 'string') {
		config = app.config.get(`queue.connections.${config}`)
	}

	if(config.isNil || typeof config !== 'object') {
		throw new Error('Invalid config')
	}

	config = { ...config }

	if(config.connection === null) {
		config.connection = app.config.get('redis.default')

		if(config.connection.isNil) {
			throw new Error('Invalid config')
		}
	}

	if(typeof config.connection === 'string') {
		config.connection = app.config.get(`redis.connections.${config.connection}`)

		if(config.connection.isNil) {
			throw new Error('Invalid config')
		}
	}

	if(!config.connection.isNil && typeof config.connection === 'object') {
		config.redis = { ...config.connection }

		if(!config.redis.password.isNil) {
			config.redis.auth = config.redis.password
			delete config.redis.password
		}
	}

	delete config.connection

	if(config.redis.isNil || typeof config.redis !== 'object') {
		throw new Error('Invalid config')
	}

	if(config.redis.host === void 0) {
		config.redis.host = 'localhost'
	}

	if(config.redis.port === void 0) {
		config.redis.port = 6379
	}

	return config
}
