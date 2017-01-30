import { Controller } from 'grind-framework'

import 'App/Support/Documentation'

export class DocsController extends Controller {
	docs = null

	constructor(app) {
		super(app)

		this.docs = new Documentation(app)
	}

	show(req, res) {
		const path = req.originalUrl.replace(/^\/docs/, '')

		if(path.length === 0) {
			return res.route('docs.show', [ 'guides', 'installation' ])
		} else if(req.params.a.isNil) {
			switch(req.params.group) {
				case 'guides':
					return res.route('docs.show', [ 'guides', 'installation' ])
				case 'structure':
					return res.route('docs.show', [ 'structure', 'index' ])
				default:
					throw new NotFoundError
			}
		}

		return Promise.all([
			this.docs.contents(req, req.params.group, path),
			this.docs.get(path)
		]).then(data => res.render('docs.show', {
			documentation: data[0],
			content: data[1],
			path: path
		}))
	}

}
