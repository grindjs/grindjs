import '@grindjs/view'

import EventEmitter from 'events'
import path from 'path'

import { Application } from '@grindjs/framework'
import { Request, Response } from 'express'

import { Container } from './Containers/Container'
import { MessagesContainer } from './Containers/MessagesContainer'
import { TimelineContainer } from './Containers/TimelineContainer'
import { IDevbar } from './IDevbar'
import { Time } from './Support/Time'

export class Devbar extends EventEmitter implements IDevbar {
	/**
	 * The app instance.
	 */
	app: Application

	/**
	 * Whether or not the instance is enabled
	 */
	isEnabled: boolean = true

	/**
	 * The req instance, if in a request lifecycle
	 */
	req?: Request

	/**
	 * The res instance, if in a request lifecycle
	 */
	res?: Response

	/**
	 * The path to the devbar templates
	 */
	viewPath: string

	/**
	 * Template to render the devbar
	 */
	template: string = 'devbar.stone'

	/**
	 * Context items that appear on the right side
	 * of the devbar
	 */
	context: string[] = []

	/**
	 * Collectors are called when the devbar starts
	 */
	collectors: ((app: Application, devbar: IDevbar) => void)[] = []

	/**
	 * Containers are groups of messages that appear
	 * on the devbar
	 */
	containers: Record<string, Container> = {
		timeline: new TimelineContainer('Timeline'),
	}

	/**
	 * Create a new devbar instance.
	 *
	 * @param  object app      App instance
	 * @param  string viewPath Path to the devbar template
	 */
	constructor(app: Application, viewPath?: string) {
		super()

		this.app = app
		this.viewPath = viewPath ?? path.join(__dirname, '../resources/views')
		this.on('error', err => Log.error('Error during devbar event', err))
	}

	clone(req: Request, res: Response): IDevbar {
		const cloned = new Devbar(this.app, this.viewPath)
		cloned.req = req
		cloned.res = res
		cloned.context = [...this.context]
		cloned.collectors = [...this.collectors]
		return cloned
	}

	time(label: string, message?: string) {
		return (this.containers.timeline as TimelineContainer).time(label, message)
	}

	timeEnd(label: string) {
		return (this.containers.timeline as TimelineContainer).timeEnd(label)
	}

	register(collector: (app: Application, devbar: IDevbar) => void) {
		this.collectors.push(collector)
	}

	add(container: string, message: string) {
		let messages = this.containers[container] as MessagesContainer

		if (!messages) {
			messages = new MessagesContainer(container)
			this.containers[container] = messages
		}

		messages.add(message)
	}

	addContext(value: string) {
		this.context.push(value)
	}

	/**
	 * @private
	 */
	_addStandardContext(duration: [number, number]) {
		this.addContext(`Duration: ${Time.toMillis(Time.flatten(duration))}ms`)
		this.addContext(`${this.req?.method} ${this.req?.route?.path}`)
	}

	start(next: (error?: any) => void) {
		if (!this.req || !this.res) {
			Log.error('Unable to start devbar, missing req/res')
			return next()
		}

		const render = this.res.render as any
		this.res.render = function (...args: any[]) {
			this.devbar!.timeEnd('request')
			this.devbar!.time('render')
			return render.call(this, ...args)
		}

		const send = this.res.send
		this.res.send = function (body) {
			const devbar = this.devbar as Devbar

			try {
				devbar.timeEnd('request')
				devbar.timeEnd('render')

				const duration = Time.get(start)
				devbar._addStandardContext(duration)

				const app = devbar.app
				body = inject(app, body, devbar, start, duration)
			} catch (err) {
				Log.error('Failed to render devbar', err)
			}

			try {
				devbar.emit('finish')
			} catch (err) {
				Log.error('Error emitting devbar finish event', err)
			}

			return send.call(this, body)
		}

		for (const collector of this.collectors) {
			collector(this.app, this)
		}

		const start = Time.get()
		this.time('request')
		return next()
	}

	/**
	 * Renders a view
	 */
	renderView(template: string, context: Record<string, any>) {
		const view = this.app.view!
		const pathname = path.join(this.viewPath, template)
		return (view.engine as any)._renderCompiled(
			(view.engine as any).compiler.compile(pathname),
			context,
		)
	}

	/**
	 * Get the current devbar from the Zone
	 */
	get current() {
		return Devbar.current
	}

	/**
	 * Get the current devbar from the Zone
	 */
	static get current(): IDevbar | null {
		const zone = (global as any).Zone?.current

		if (!zone) {
			return null
		}

		return zone.get('devbar')
	}
}

/**
 * Renders and injects the devbar to the body
 */
function inject(
	app: Application,
	body: any,
	devbar: Devbar,
	start: [number, number],
	duration: [number, number],
) {
	let index = null

	if (typeof body !== 'string' || (index = body.indexOf('</body>')) === -1) {
		return body
	}

	const html = devbar.renderView(devbar.template, {
		devbar: devbar,
		start: Time.flatten(start),
		duration: Time.flatten(duration),
		context: devbar.context,
		containers: Object.values(devbar.containers),
	})

	return body.substring(0, index) + html + body.substring(index)
}
