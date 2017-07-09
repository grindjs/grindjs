const CssReloader = require('./CssReloader')
const ScssReloader = require('./ScssReloader')
const JsReloader = require('./JsReloader')

function LiveReload() {
	if(window.WebSocket.isNil) {
		throw new Error('This browser does not support websockets, live reload will not work.')
	}

	let attempts = 0
	connect()

	function onAssetChanged(pathname) {
		if(/(scss|sass)$/i.test(pathname)) {
			ScssReloader.reload(pathname)
		} else if(/css$/i.test(pathname)) {
			CssReloader.reload(pathname)
		} else if(/js$/i.test(pathname)) {
			JsReloader.reload(pathname)
		}
	}

	function connect() {
		const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
		const socket = new WebSocket(`${protocol}://${window.location.host}/_livereload`)

		socket.onopen = () => {
			attempts = 1
		}

		socket.onclose = _reconnect
		socket.onerror = _reconnect

		socket.onmessage = message => {
			onAssetChanged(message.data)
		}

		return socket
	}

	function _reconnect() {
		const delay = Math.min(30, (Math.pow(2, attempts) - 1)) * 1000

		setTimeout(() => {
			attempts++
			connect()
		}, delay)
	}
}

LiveReload()
