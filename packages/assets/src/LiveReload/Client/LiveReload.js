import './CssReloader'
import './ScssReloader'

class LiveReload {

	constructor() {
		if(window.WebSocket.isNil) {
			throw new Error('This browser does not support web sockets, live reload will not work.')
		}

		this.socket = this.open()
	}

	onAssetChanged(pathname) {
		if(/(scss|sass)$/i.test(pathname)) {
			ScssReloader.reload(pathname)
		} else if(/css$/i.test(pathname)) {
			CssReloader.reload(pathname)
		}
	}

	open() {
		const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
		const socket = new WebSocket(`${protocol}://${window.location.host}/_livereload`)

		socket.onopen = () => {
			this.attempts = 1
		}

		socket.onclose = this._reconnect.bind(this)
		socket.onerror = this._reconnect.bind(this)

		socket.onmessage = message => {
			this.onAssetChanged(message.data)
		}

		return socket
	}

	_reconnect() {
		this.socket = null
		const delay = Math.min(30, (Math.pow(2, this.attempts) - 1)) * 1000

		setTimeout(() => {
			this.attempts++
			this.open()
		}, delay)
	}

}

window.__liveReload = new LiveReload
