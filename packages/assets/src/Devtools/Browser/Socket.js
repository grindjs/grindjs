export function Socket() {
	if(!window.WebSocket) {
		throw new Error('This browser does not support websockets, live reload will not work.')
	}

	const listeners = { }
	let attempts = 0
	let attemptsReset = null
	let pending = false
	let socket = connect()

	function connect() {
		const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
		const socket = new WebSocket(`${protocol}://${window.location.host}/@assets/socket`)

		socket.onopen = () => {
			if(attemptsReset) {
				clearTimeout(attemptsReset)
			}

			attemptsReset = setTimeout(() => {
				attempts = 1
			}, 1000)
		}

		socket.onclose = _reconnect.bind(null, 'close')
		socket.onerror = _reconnect.bind(null, 'error')

		socket.onmessage = message => {
			message = JSON.parse(message.data)
			{ (listeners[message.type] || [ ]).forEach(listener => listener(message.asset)) }
		}

		return socket
	}

	function _reconnect() {
		if(socket.readyState === WebSocket.OPEN) {
			return
		}

		if(pending) {
			return
		} else {
			pending = true
		}

		const delay = Math.min(30, (Math.pow(2, attempts) - 1)) * 1000

		if(attemptsReset) {
			clearTimeout(attemptsReset)
			attemptsReset = null
		}

		setTimeout(() => {
			attempts++
			pending = false
			socket = connect()
		}, delay)
	}

	return {
		on: (event, callback) => {
			if(!Array.isArray(listeners[event])) {
				listeners[event] = [ ]
			}

			listeners[event].push(callback)
		}
	}
}
