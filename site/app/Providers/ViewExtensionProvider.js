import 'App/Support/Highlighter'

export function ViewExtensionProvider(app) {
	const cache = { }

	app.view.filter('highlight', (content, lang) => {
		let highlighted = cache[content]

		if(highlighted.isNil) {
			highlighted = app.view.toHtmlString(Highlighter(content, lang))
			cache[content] = highlighted
		}

		return highlighted
	})

	app.view.filter('formatVersion', version => {
		if(version === 'master') {
			return 'Latest'
		}

		return version
	})

	app.view.filter('set', (object, key, value) => {
		object[key] = value
		return object
	})

}
