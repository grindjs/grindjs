export class Job {
	static jobName = null

	static priority = 'normal'
	static tries = 1
	static retryDelay = null
	static timeout = null

	$options = {
		priority: null,
		delay: null,
		tries: null,
		retryDelay: null,
		timeout: null
	}

	// eslint-disable-next-line no-unused-vars
	$handle(app, queue) {
		//
	}

	$priority(value) {
		this.$options.priority = value
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

}
