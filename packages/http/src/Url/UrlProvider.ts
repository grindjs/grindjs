import { Provider } from '@grindjs/framework'

export const UrlProvider: Provider = async function (app) {
	const urlGeneratorClass =
		app.kernel.options.urlGeneratorClass || (await import('./UrlGenerator')).UrlGenerator
	app.url = new urlGeneratorClass(app)
}

UrlProvider.priority = Infinity

declare module '@grindjs/framework' {
	interface Application {
		url?: import('./UrlGenerator').UrlGenerator
	}
}
