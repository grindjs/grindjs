const path = require('path')

export class Devbar {

	/**
	 * The app instance.
	 */
	app = null

	/**
	 * The req instance, if in a request lifecycle
	 */
	req = null

	/**
	 * The res instance, if in a request lifecycle
	 */
	res = null

	/**
	 * The path of the devbar template to render
	 */
	viewPath = null

	/**
	 * Timeline object to track time/timeEnd
	 */
	timeline = { }

	/**
	 * Context items that appear on the right side
	 * of the devbar
	 */
	context = [ ]

	/**
	 * Containers are groups of messages that appear
	 * on the devbar
	 */
	containers = { }

	/**
	 * Create a new devbar instance.
	 *
	 * @param  object app      App instance
	 * @param  string viewPath Path to the devbar template
	 */
	constructor(app, viewPath = null) {
		this.app = app
		this.viewPath = viewPath || path.join(__dirname, '../resources/views/devbar.stone')
	}

	/**
	 * Clone the instance to be used within a
	 * request cycle.
	 *
	 * @param object req
	 * @param object res
	 *
	 * @return object
	 */
	clone(req, res) {
		const cloned = new this.constructor(this.app, this.viewPath)
		cloned.req = req
		cloned.res = res
		cloned.context = [ ...this.context ]
		return cloned
	}

	/**
	 * Starts a timer that can be used to compute the duration of
	 * an operation. Timers are identified by a unique label. Use
	 * the same label when calling devbar.timeEnd() to stop the
	 * timer and the elapsed time in milliseconds to devbar’s
	 * timeline.
	 *
	 * @param  string label Unique label to identify this operation
	 */
	time(label) {
		this.timeline[label] = {
			start: process.hrtime()
		}
	}

	/**
	 * Stops a timer that was previously started by calling devbar.time()
	 * and adds the entry to the devbar’s timeline.
	 *
	 * @param  string label Unique label originally passed to devbar.time()
	 */
	timeEnd(name) {
		const timing = this.timeline[name]

		if(timing === void 0 || timing.duration !== void 0) {
			return
		}

		timing.duration = process.hrtime(timing.start)
	}

	/**
	 * Push a message onto a container
	 * @param string container Container label to appear on the devbar
	 * @param mixed  message   Message string or object containing a message
	 *                         property and a start or duration property
	 */
	add(container, message) {
		if(typeof message === 'object') {
			if(message.duration.isNil && !message.start.isNil) {
				message.duration = process.hrtime(message.start)
			}

			message.duration = flattenTime(message.duration)
			message.durationInMs = Math.round(message.duration) / 1000.0
		}

		(this.containers[container] = this.containers[container] || [ ]).push(message)
	}

	/**
	 * Adds a context item
	 *
	 * @param string value
	 */
	addContext(value) {
		this.context.push(value)
	}

	/**
	 * @private
	 */
	_addStandardContext(duration) {
		this.addContext(`Duration: ${Math.round(flattenTime(duration)) / 1000.0}ms`)
		this.addContext(`${this.req.method} ${this.req.route.path}`)
	}

	/**
	 * Starts the devbar middleware
	 *
	 * @param  {Function} next
	 */
	start(next) {
		if(this.req.isNil || this.res.isNil) {
			Log.error('Unable to start devbar, missing req/res')
			return next()
		}

		const start = process.hrtime()

		const render = this.res.render
		this.res.render = function(...args) {
			this.devbar.timeEnd('request')
			this.devbar.time('render')
			return render.call(this, ...args)
		}

		const send = this.res.send
		this.res.send = function(body) {
			try {
				const devbar = this.devbar
				devbar.timeEnd('request')
				devbar.timeEnd('render')

				const duration = process.hrtime(start)
				devbar._addStandardContext(duration)

				const app = devbar.app
				body = inject(app, body, devbar, start, duration)
			} catch(err) {
				Log.error('Failed to render devbar', err)
			}

			return send.call(this, body)
		}

		this.time('request')
		next()
	}

}

/**
 * Renders and injects the devbar to the body
 */
function inject(app, body, devbar, start, duration) {
	let index = null

	if(typeof body !== 'string' || (index = body.indexOf('</body>')) === -1) {
		return body
	}

	const view = app.view

	const html = view.engine._renderCompiled(view.engine.compiler.compile(devbar.viewPath, true), {
		devbar: devbar,
		start: flattenTime(start),
		duration: flattenTime(duration),
		context: devbar.context,
		containers: Object.entries(devbar.containers),
		timeline: Object.entries(devbar.timeline).map(([ label, item ]) => {
			if(!item.duration) {
				return null
			}

			item.duration = flattenTime(item.duration)

			return {
				label: label,
				start: flattenTime(item.start),
				duration: item.duration,
				durationInMs: Math.round(item.duration) / 1000.0
			}
		}).filter(item => item !== null)
	})

	return body.substring(0, index) + html + body.substring(index)
}

/**
 * Converts hrtime tuple to microseconds
 */
function flattenTime(time) {
	return (time[0] * 1000000) + (time[1] / 1000)
}
