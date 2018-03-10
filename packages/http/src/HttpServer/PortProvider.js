export function PortProvider(app) {
	Object.defineProperty(app, 'port', {
		value: app.kernel.options.port || process.env.NODE_PORT || app.config.get('app.port', 3000),
		writable: false
	})
}

PortProvider.priority = Infinity
