import { Controller } from 'grind-framework'

import 'App/Support/Markdown'

export class DocsController extends Controller {

	show(req, res) {
		let path = req.originalUrl.replace(/^\/docs/, '')

		if(path.length === 0) {
			return res.route('docs.show', [ 'guides', 'installation' ])
		}

		path = this.app.paths.base('resources/docs', path)

		return Promise.all([
			Markdown.renderFile(
				this.app,
				this.app.paths.base('resources/docs/guides/documentation.markdown')
			).then(content => {
				const components = path.split(/\//)
				const active = components[components.length - 1]

				return content.replace(
					new RegExp(`<a href="(${active})">`),
					'<a href="$1" class="docs-navigation-active">'
				)
			}),

			Markdown.renderFile(this.app, `${path}.markdown`)
		]).then(data => res.render('docs.show', {
			documentation: data[0],
			content: data[1]
		}))
	}

}
