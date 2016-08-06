import './HtmlBuilder'
import './FormBuilder'

export function HtmlProvider(app, htmlBuilderClass, formBuilderClass) {
	htmlBuilderClass = htmlBuilderClass || HtmlBuilder
	formBuilderClass = formBuilderClass || FormBuilder

	const html = new htmlBuilderClass(app)
	const form = new formBuilderClass(app, html)

	app.set('html', html)
	app.set('form', form)

	if(!app.view.isNil) {
		app.view.share('html', html)
		app.view.share('form', form)
	}
}
