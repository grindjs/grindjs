import '../HtmlString'

export function Functions(view) {
	view.addFunction('markHtml', html => new HtmlString(html))
}
