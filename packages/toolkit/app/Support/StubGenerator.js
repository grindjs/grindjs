import { AbortError } from '@grindjs/cli'
import { FS } from '@grindjs/support'

const path = require('path')

export class StubGenerator {
	app = null

	constructor(app) {
		this.app = app
	}

	async generate(stub, target, context) {
		// Check if the target already exists
		if (await FS.exists(target)) {
			throw new AbortError(
				`${path.relative(process.cwd(), target)} already exists. Refusing to overwrite.`,
			)
		}

		// Make sure the path exists
		if (!(await FS.exists(path.dirname(target)))) {
			await FS.mkdirp(path.dirname(target))
		}

		// Render the stub
		const content = await this.app.view.render(stub, context)

		// Write the target
		return FS.writeFile(target, `${content.trim()}\n`)
	}
}
