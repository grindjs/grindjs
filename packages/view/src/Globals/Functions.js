export function Functions(view) {
	view.addFunction('route', (name, parameters) => {
		return view.app.url.route(name, parameters)
	})
}
