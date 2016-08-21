import '../HtmlString'

export function Filters(view) {
	view.addFilter('spaceless', html => new HtmlString(html.replace(/>\s+</g, '><')))
}
