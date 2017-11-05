import { CssReloader } from './CssReloader'
import { ScssReloader } from './ScssReloader'
import { JsReloader } from './JsReloader'

function LiveReload() {
	if(!window.WebSocket) {
		throw new Error('This browser does not support websockets, live reload will not work.')
	}

	let attempts = 0
	let attemptsReset = null
	let pending = false
	let socket = connect()

	function onAssetChanged(pathname) {
		if(/(scss|sass)$/i.test(pathname)) {
			ScssReloader(pathname)
		} else if(/css$/i.test(pathname)) {
			CssReloader(pathname)
		} else if(/js$/i.test(pathname)) {
			JsReloader(pathname)
		}
	}

	function connect() {
		const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
		const socket = new WebSocket(`${protocol}://${window.location.host}/_livereload`)

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
			onAssetChanged(message.data)
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
}

LiveReload()
