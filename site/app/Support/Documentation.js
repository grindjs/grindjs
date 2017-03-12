import 'App/Support/Markdown'

import path from 'path'

export class Documentation {
	app = null
	basePath = null

	constructor(app) {
		this.app = app
		this.basePath = this.app.paths.base('resources/docs')
	}

	contents(req, version, group, active) {
		return Markdown.renderFile(
			this.app,
			path.join(this.basePath, version, group, 'documentation.markdown')
		).then(({ content }) => {
			const components = active.split(/\//)
			active = components[components.length - 1]

			return content.replace(
				new RegExp(`<a href="(${active})">`),
				'<a href="$1" class="docs-navigation-active">'
			).replace(/href="([^"#]+)"/g, (_, link) => {
				const components = link.split('/')

				return `href="${this.app.url.route(
					'docs.show',
					[ version, group, ...components ],
					req
				).replace(/\/$/g, '')}"`
			})
		})
	}

	get(pathname) {
		return Markdown.renderFile(this.app, path.join(this.basePath, `${pathname}.markdown`))
	}

}
