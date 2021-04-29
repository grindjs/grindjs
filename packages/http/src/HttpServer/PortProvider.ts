import { Provider } from '@grindjs/framework'

export const PortProvider: Provider = function (app) {
	Object.defineProperty(app, 'port', {
		value: app.kernel.options.port || process.env.NODE_PORT || app.config.get('app.port', 3000),
		writable: false,
	})
}

PortProvider.priority = Infinity

declare module '@grindjs/framework' {
	interface Application {
		readonly port?: number
	}
}
