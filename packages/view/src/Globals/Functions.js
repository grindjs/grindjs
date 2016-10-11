import { runtime as NunjucksRuntime } from 'nunjucks'

export function Functions(view) {
	view.addFunction('markHtml', html => new NunjucksRuntime.SafeString(html))
}
