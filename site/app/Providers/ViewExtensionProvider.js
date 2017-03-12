import 'App/Support/Highlighter'

export function ViewExtensionProvider(app) {
	const cache = { }

	app.view.share('highlight', (lang, content) => {
		let highlighted = cache[content]

		if(highlighted.isNil) {
			highlighted = app.view.toHtmlString(Highlighter(content.trim(), lang))
			cache[content] = highlighted
		}

		return highlighted
	})

	app.view.extend('highlight', () => 'let tmpOutput = output;\noutput = \'\';')
	app.view.extend('endhighlight', (context, lang) => {
		return `tmpOutput += highlight(${lang}, output);\noutput = tmpOutput;`
	})

	app.view.share('formatVersion', version => {
		if(version === 'master') {
			return 'Latest'
		}

		return version
	})

	app.view.share('extend', Object.assign)

}
