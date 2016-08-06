import './HtmlBuilder'
import './FormBuilder'

export function HtmlProvider(app, htmlBuilderClass, formBuilderClass) {
	htmlBuilderClass = htmlBuilderClass || HtmlBuilder
	formBuilderClass = formBuilderClass || FormBuilder

	const html = new htmlBuilderClass(app)
	const form = new formBuilderClass(app, html)

	app.html = html
	app.form = form

	if(!app.view.isNil) {
		app.use((req, res, next) => {
			res.locals.html = html.clone(req, res)
			res.locals.form = form.clone(req, res, res.locals.html)
			next()
		})
	}
}

HtmlProvider.priority = 20000
