import 'App/Support/Highlighter'

import { runtime as NunjucksRuntime } from 'nunjucks'

export function ViewExtensionProvider(app) {
	const cache = { }

	app.view.addFilter('highlight', (content, lang) => {
		let highlighted = cache[content]

		if(highlighted.isNil) {
			highlighted = new NunjucksRuntime.SafeString(Highlighter(content, lang))
			cache[content] = highlighted
		}

		return highlighted
	})
}
