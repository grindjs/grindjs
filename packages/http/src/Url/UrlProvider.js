export function UrlProvider(app) {
	const urlGeneratorClass = app.kernel.options.urlGeneratorClass || require('./UrlGenerator.js').UrlGenerator
	app.url = new urlGeneratorClass(app)
}

UrlProvider.priority = Infinity
