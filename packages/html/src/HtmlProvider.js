import './HtmlBuilder'
import './FormBuilder'

export function HtmlProvider(app) {
	const html = new HtmlBuilder(app)
	const form = new FormBuilder(app, html)

	app.set('html', html)
	app.set('form', form)

	if(!app.view.isNil) {
		app.view.share('html', html)
		app.view.share('form', form)
	}
}
