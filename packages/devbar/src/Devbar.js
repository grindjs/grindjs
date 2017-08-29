const path = require('path')
const EventEmitter = require('events')

import './Containers/TimelineContainer'
import './Containers/MessagesContainer'
import './Support/Time'

export class Devbar extends EventEmitter {

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
	 * The path to the devbar templates
	 */
	viewPath = null

	/**
	 * Template to render the devbar
	 */
	template = 'devbar.stone'

	/**
	 * Context items that appear on the right side
	 * of the devbar
	 */
	context = [ ]

	/**
	 * Collectors are called when the devbar starts
	 */
	collectors = [ ]

	/**
	 * Containers are groups of messages that appear
	 * on the devbar
	 */
	containers = {
		timeline: new TimelineContainer('Timeline')
	}

	/**
	 * Create a new devbar instance.
	 *
	 * @param  object app      App instance
	 * @param  string viewPath Path to the devbar template
	 */
	constructor(app, viewPath = null) {
		super()

		this.app = app
		this.viewPath = viewPath || path.join(__dirname, '../resources/views')
		this.on('error', err => Log.error('Error during devbar event', err))
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
		cloned.collectors = [ ...this.collectors ]
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
		return this.containers.timeline.time(label)
	}

	/**
	 * Stops a timer that was previously started by calling devbar.time()
	 * and adds the entry to the devbar’s timeline.
	 *
	 * @param  string label Unique label originally passed to devbar.time()
	 */
	timeEnd(label) {
		return this.containers.timeline.timeEnd(label)
	}

	/**
	 * Registers a collector to be started with the devbar
	 */
	register(collector) {
		this.collectors.push(collector)
	}

	/**
	 * Push a message onto a container
	 * @param string container Container label to appear on the devbar
	 * @param mixed  message   Message string or object containing a message
	 *                         property and a start or duration property
	 */
	add(container, message) {
		let messages = this.containers[container]

		if(messages.isNil) {
			messages = new MessagesContainer(container)
			this.containers[container] = messages
		}

		messages.add(message)
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
		this.addContext(`Duration: ${Time.toMillis(Time.flatten(duration))}ms`)
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

		const render = this.res.render
		this.res.render = function(...args) {
			this.devbar.timeEnd('request')
			this.devbar.time('render')
			return render.call(this, ...args)
		}

		const send = this.res.send
		this.res.send = function(body) {
			const devbar = this.devbar

			try {
				devbar.timeEnd('request')
				devbar.timeEnd('render')

				const duration = Time.get(start)
				devbar._addStandardContext(duration)

				const app = devbar.app
				body = inject(app, body, devbar, start, duration)
			} catch(err) {
				Log.error('Failed to render devbar', err)
			}

			try {
				devbar.emit('finish')
			} catch(err) {
				Log.error('Error emitting devbar finish event', err)
			}

			return send.call(this, body)
		}

		for(const collector of this.collectors) {
			collector(this.app, this)
		}

		const start = Time.get()
		this.time('request')
		return next()
	}

	/**
	 * Renders a view
	 */
	renderView(template, context) {
		const view = this.app.view
		const pathname = path.join(this.viewPath, template)
		return view.engine._renderCompiled(view.engine.compiler.compile(pathname, true), context)
	}

	/**
	 * Get the current devbar from the Zone
	 */
	get current() {
		return this.constructor.current
	}

	/**
	 * Get the current devbar from the Zone
	 */
	static get current() {
		const zone = (global.Zone || { }).current

		if(zone.isNil) {
			return null
		}

		return zone.get('devbar')
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

	const html = devbar.renderView(devbar.template, {
		devbar: devbar,
		start: Time.flatten(start),
		duration: Time.flatten(duration),
		context: devbar.context,
		containers: Object.values(devbar.containers)
	})

	return body.substring(0, index) + html + body.substring(index)
}
