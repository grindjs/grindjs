import { Controller } from 'grind-framework'

import 'App/Support/Markdown'

export class DocsController extends Controller {

	show(req, res) {
		let path = req.originalUrl.replace(/^\/docs/, '')

		if(path.length === 0) {
			return res.route('docs.show', [ 'guides', 'installation' ])
		}

		path = this.app.paths.base('docs', path)


		return Promise.all([
			Markdown.renderFile(this.app.paths.base('docs/guides/documentation.markdown')),
			Markdown.renderFile(`${path}.markdown`)
		]).then(data => res.render('docs.show', {
			documentation: data[0],
			content: data[1]
		}))
	}

}
