export class Job {

	static jobName = null

	static queue = null
	static tries = 1
	static retryDelay = null
	static timeout = null

	$options = {
		id: null,
		queue: null,
		delay: null,
		tries: null,
		retryDelay: null,
		timeout: null
	}

	// eslint-disable-next-line no-unused-vars
	$handle(app, queue) {
		//
	}

	$touch(app, state = 'running') {
		return this.$updateState(app, state)
	}

	$updateState(app, state, context = { }) {
		if(!app.queue.stateful || typeof this.$id !== 'string') {
			return Promise.resolve()
		}

		if(app.cache.isNil) {
			Log.warning('WARNING: `grind-cache` must be loaded to use stateful jobs')
			return Promise.resolve()
		}

		// Using Job over this.constructor to prevent overriding of stateKey
		return app.cache.set(Job.stateKey(this.$id), {
			state,
			...context,
			lastActivity: Date.now(),
			id: this.$id
		}, {
			ttl: app.queue.statefulTtl
		})
	}

	// eslint-disable-next-line no-unused-vars
	$success(app, queue) {
		//
	}

	// eslint-disable-next-line no-unused-vars
	$fatal(app, queue, error) {
		//
	}

	$queue(value) {
		this.$options.queue = value
		return this
	}

	$delay(value) {
		this.$options.delay = value
		return this
	}

	$tries(value) {
		this.$options.tries = value
		return this
	}

	$retryDelay(value) {
		this.$options.retryDelay = value
		return this
	}

	$timeout(value) {
		this.$options.timeout = value
		return this
	}

	toJSON() {
		return this.$toJson()
	}

	$toJson() {
		const json = Object.assign({ }, this)

		for(const key of Object.keys(json)) {
			if(key.substring(0, 1) !== '$') {
				continue
			}

			delete json[key]
		}

		return json
	}

	static fromJson(json) {
		return Object.assign(Object.create(this.prototype), json)
	}

	static stateKey(id) {
		return `grind-queue:job:${id}`
	}

}
