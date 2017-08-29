import './Errors/StoneCompilerError'
import './StoneTemplate'

const fs = require('fs')

export class Compiler {
	engine = null
	directives = { }
	compiled = { }

	constructor(engine) {
		this.engine = engine
		this.disableCache = engine.app.config.get('view.disable_cache', false)
	}

	compile(template, force = null) {
		let compiled = force || this.disableCache ? null : this.compiled[template]

		if(typeof compiled === 'function') {
			return compiled
		}

		// eslint-disable-next-line no-sync
		compiled = this.compileString(fs.readFileSync(template).toString(), true, template)
		this.compiled[template] = compiled

		return compiled
	}

	compileString(contents, shouldEval = true, file = null) {
		if(!file.isNil) {
			this.engine.view.emit('compile:start', file)
		}

		const template = new StoneTemplate(this, contents, file)

		try {
			template.compile()
		} catch(err) {
			if(!err._hasTemplate) {
				err._hasTemplate = true
				err.file = file

				if(file) {
					err.message += ` in template ${file}.`
				}
			}

			throw err
		} finally {
			if(!file.isNil) {
				this.engine.view.emit('compile:end', file)
			}
		}

		if(!shouldEval) {
			return template.toString()
		}

		return template.toFunction()
	}

	compileDirective(context, name, args) {
		if(name === 'directive') {
			// Avoid infinite loop
			return null
		}

		if(typeof this.directives[name] === 'function') {
			return this.directives[name](context, args)
		}

		const method = `compile${name[0].toUpperCase()}${name.substring(1)}`

		if(typeof this[method] !== 'function') {
			throw new StoneCompilerError(context, `@${name} is not a valid Stone directive.`)
		}

		return this[method](context, args)
	}

	compileEnd() {
		return '}'
	}

}

// Load in the rest of the compilers
for(const [ name, func ] of Object.entries({
	...require('./Compiler/Assignments'),
	...require('./Compiler/Components'),
	...require('./Compiler/Conditionals'),
	...require('./Compiler/Layouts'),
	...require('./Compiler/Loops'),
	...require('./Compiler/Macros'),
	...require('./Compiler/Outputs'),
})) {
	Compiler.prototype[name] = func
}
