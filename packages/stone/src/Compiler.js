import './Errors/StoneCompilerError'
import './StoneTemplate'

const fs = require('fs')

export class Compiler {
	engine = null
	directives = { }
	compiled = { }

	constructor(engine) {
		this.engine = engine
	}

	compile(template, force = false) {
		let compiled = force ? null : this.compiled[template]

		if(typeof compiled === 'function') {
			return compiled
		}

		// eslint-disable-next-line no-sync
		compiled = this.compileString(fs.readFileSync(template).toString(), true, template)
		this.compiled[template] = compiled

		return compiled
	}

	compileString(contents, shouldEval = true, file = null) {
		const template = new StoneTemplate(contents, file)
		template.compile(this)

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
	...require('./Compiler/Conditionals'),
	...require('./Compiler/Layouts'),
	...require('./Compiler/Loops'),
	...require('./Compiler/Outputs'),
})) {
	Compiler.prototype[name] = func
}
