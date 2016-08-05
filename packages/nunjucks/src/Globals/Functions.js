import '../HtmlString'

export function Functions(view) {
	view.addFunction('route', (name, parameters) => {
		return view.app.url.route(name, parameters)
	})

	view.addFunction('markHtml', html => new HtmlString(html))
}
