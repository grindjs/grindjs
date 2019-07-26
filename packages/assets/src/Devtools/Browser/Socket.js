export function Socket(referenceScript) {
	if(!window.WebSocket) {
		throw new Error('This browser does not support websockets, live reload will not work.')
	}

	const listeners = { }
	let attempts = 0
	let attemptsReset = null
	let pending = false
	let socket = connect()
	let firstConnect = true

	function connect() {
		const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
		const socket = new WebSocket(`${protocol}://${window.location.host}/@assets/socket`)

		socket.onopen = () => {
			if(attemptsReset) {
				clearTimeout(attemptsReset)
			}

			if(firstConnect && !referenceScript.isNil && referenceScript.hasAttribute('data-since')) {
				socket.send(JSON.stringify({ type: 'init', since: Number(referenceScript.getAttribute('data-since')) }))
			}

			attemptsReset = setTimeout(() => {
				attempts = 1
			}, 1000)

			firstConnect = false
		}

		socket.onclose = _reconnect.bind(null, 'close')
		socket.onerror = _reconnect.bind(null, 'error')

		socket.onmessage = message => {
			message = JSON.parse(message.data)
			{ (listeners[message.type] || [ ]).forEach(listener => listener(message.asset, message)) }
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
