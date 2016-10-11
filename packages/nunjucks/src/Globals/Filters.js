import { runtime as NunjucksRuntime } from 'nunjucks'

export function Filters(view) {
	view.addFilter('spaceless', html => new NunjucksRuntime.SafeString(html.replace(/>\s+</g, '><')))
}
