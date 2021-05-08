import { EventEmitter } from 'events'

import { Application } from '@grindjs/framework'

import { IDevbar } from '../IDevbar'

export function EventCollectorBuilder(app: Application, devbar: IDevbar, emitter: EventEmitter) {
	return {
		on: (event: string, handler: (...args: any[]) => void) => {
			const wrapped = wrapHandler(devbar, handler)
			emitter.on(event, wrapped)
			devbar.on('finish', () => emitter.removeListener(event, wrapped))
		},
	}
}

function wrapHandler(devbar: IDevbar, handler: Function) {
	return (...args: any[]) => {
		const current = devbar.current

		if (!current) {
			return
		}

		try {
			handler(current, ...args)
		} catch (err) {
			Log.error('Error collecting event', err)
		}
	}
}
