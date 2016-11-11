import { Command } from 'grind-cli'

import './FS'

import Nunjucks from 'nunjucks'
import Path from 'path'

export class ViewCacheCommand extends Command {
	name = 'view:cache'
	description = 'Precompiles and caches all views'

	async run() {
		const result = Nunjucks.precompile(this.app.view.viewPath, {
			env: this.app.view.nunjucks,
			include: [ /\.njk$/ ],
			wrapper: templates => {
				let out = `const templates = { };\nmodule.exports.templates = templates;\n\n`

				for(const template of templates) {
					const name = JSON.stringify(template.name)

					out += `templates[${name}] = (function() {${template.template}})();`
				}

				return out
			}
		})

		const dir = Path.dirname(this.app.view.compiledViewPath)

		if(!(await FS.exists(dir))) {
			await FS.mkdirp(dir)
			await FS.writeFile(Path.join(dir, '.gitignore'), `*\n!.gitignore\n`)
		}

		await FS.writeFile(this.app.view.compiledViewPath, result)
		Log.success('Done')
	}

}
