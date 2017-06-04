import { FS } from 'grind-support'
import './AST'

const path = require('path')

export class CacheManager {
	engine = null
	compiledViewPath = null

	constructor(app, engine) {
		this.app = app
		this.engine = engine
		this.compiledViewPath = app.paths.base('storage/views/compiled.js')
	}

	exists() {
		if(this.app.config.get('view.ignore-compiled', false)) {
			return false
		}

		return FS.exists(this.compiledViewPath)
	}

	load() {
		const cache = require(this.compiledViewPath).cache
		const viewPath = this.engine.view.viewPath

		for(const [ view, template ] of Object.entries(cache)) {
			this.engine.compiler.compiled[path.resolve(viewPath, view)] = template
		}
	}

	async write() {
		const viewPath = this.engine.view.viewPath
		const files = (await FS.recursiveReaddir(viewPath)).filter(
			view => path.extname(view) === '.stone'
		)

		let contents = 'module.exports.cache = {\n'

		for(const file of files) {
			contents += `'${path.relative(viewPath, file)}': `
			contents += this.engine.compiler.compileString((await FS.readFile(file)).toString(), false)
			contents += ',\n'
		}

		contents += '}'

		let tree = null

		try {
			// Has the benefit of both validating syntax errors
			// and allows for nicer code formatting

			tree = AST.parse(contents)
		} catch(causedBy) {
			const err = new Error(`Error compiling views: ${causedBy.message}`)
			err.causedBy = causedBy
			throw err
		}

		const dir = path.dirname(this.compiledViewPath)

		if(!(await FS.exists(dir))) {
			await FS.mkdirp(dir)
			await FS.writeFile(path.join(dir, '.gitignore'), '*\n!.gitignore\n')
		}

		return FS.writeFile(this.compiledViewPath, AST.stringify(tree))
	}

	async clear() {
		if(await this.exists()) {
			await FS.unlink(this.compiledViewPath)
		}
	}

}
