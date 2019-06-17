export function buildRedisConfig(app, connection) {
	if(connection.isNil) {
		connection = app.config.get('redis.default', null)
	}

	if(typeof connection === 'string') {
		connection = app.config.get(`redis.connections.${connection}`)
	}

	if(connection.isNil) {
		throw new Error('Invalid redis connection for queue')
	}

	let { host, port, password } = connection

	if(typeof host !== 'string') {
		host = 'localhost'
	}

	if(typeof port !== 'number') {
		port = 6379
	}

	if(typeof password !== 'string') {
		password = void 0
	}

	return { host, port, password }
}
