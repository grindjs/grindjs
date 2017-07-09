const url = require('url')

export function UpgradeDispatcher(upgraders, req, socket, ...args) {
	req.pathname = url.parse(req.url).pathname

	// Loop through registered handlers to find a matching upgrader
	for(const [ pathname, handler ] of Object.entries(upgraders)) {
		if(pathname !== req.pathname) {
			continue
		}

		return handler(req, socket, ...args)
	}

	// If no paths matched, destroy
	socket.destroy()
}
