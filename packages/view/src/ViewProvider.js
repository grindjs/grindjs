import './ViewFactory'

export function ViewProvider(app) {
	app.view = new ViewFactory(app)
}

ViewProvider.priority = 30000
