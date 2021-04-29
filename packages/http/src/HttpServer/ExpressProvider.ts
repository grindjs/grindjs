import { Provider } from '@grindjs/framework'

export const ExpressProvider: Provider = async function (app) {
	const { default: express } = await import('express')
	app.express = express()
	app.express.disable('etag')
	;(app.express as any)._grind = app
	app.enable = app.express.enable.bind(app.express)
	app.disable = app.express.disable.bind(app.express)
}

ExpressProvider.priority = Infinity

declare module '@grindjs/framework' {
	interface Application {
		express?: import('express').Express
		enable?(setting: string): void
		disable?(setting: string): void
	}
}
