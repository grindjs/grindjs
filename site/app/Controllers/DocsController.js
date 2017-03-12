import { Controller } from 'grind-framework'
import fs from 'fs'

import 'App/Support/Documentation'

export class DocsController extends Controller {
	docs = null
	versions = null
	currentVersion = null

	constructor(app) {
		super(app)

		this.docs = new Documentation(app)

		// eslint-disable-next-line no-sync
		this.versions = fs.readdirSync(this.docs.basePath).sort().reverse()
		this.currentVersion = this.versions.find(version => version !== 'master')
	}

	show(req, res) {
		const path = req.originalUrl.replace(/^\/docs/, '').replace(/\/$/g, '')

		if(path.length === 0 || req.params.group.isNil) {
			return res.route('docs.show', [ this.currentVersion, 'guides', 'installation' ])
		} else if(req.params.version.isNil) {
			const params = Object.values(req.params).filter(param => !param.isNil)
			params.unshift(this.currentVersion)

			return res.route('docs.show', params)
		} else if(req.params.a.isNil) {
			switch(req.params.group) {
				case 'guides':
					return res.route('docs.show', [ req.params.version, 'guides', 'installation' ])
				case 'structure':
					return res.route('docs.show', [ req.params.version, 'structure', 'index' ])
				default:
					throw new NotFoundError
			}
		}

		return Promise.all([
			this.docs.contents(req, req.params.version, req.params.group, path),
			this.docs.get(path)
		]).then(([ documentation, { content, title } ]) => res.render('docs.show', {
			documentation: documentation,
			content: content,
			title: title,
			path: path,
			activeVersion: req.params.version,
			versions: this.versions,
			routeParams: req.params
		}))
	}

}
