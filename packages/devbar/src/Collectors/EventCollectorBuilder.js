export function EventCollectorBuilder(app, devbar, emitter) {
	return {
		on: (event, handler) => {
			const wrapped = wrapHandler(devbar, handler)
			emitter.on(event, wrapped)
			devbar.on('finish', () => emitter.removeListener(event, wrapped))
		}
	}
}

function wrapHandler(devbar, handler) {
	return (...args) => {
		const current = devbar.current

		if(current.isNil) {
			return
		}

		try {
			handler(current, ...args)
		} catch(err) {
			Log.error('Error collecting event', err)
		}
	}
}
