import './Errors/StoneCompilerError'

import './Support/contextualize'
import './Support/nextIndexOf'
import './Support/sanitizeHtml'

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
		const context = {
			template: {
				file: file,
				contents: contents,
				lines: contents.split(/\n/).map(line => line.length)
			},
			compile: {
				index: 0
			},
			layout: null,
			sections: [ ],
			spaceless: 0
		}

		// Strip comments
		contents = contents.trim().replace(/\{\{--([\s\S]+)--\}\}/g, '')

		// Loop through and find all directives
		const expressions = [ ]
		let match = null

		while((match = contents.match(/@(\w+)([ \t]*\()?\n*/))) {
			if(match.index > 0) {
				let string = contents.substring(0, match.index)

				if(string.trim().length > 0) {
					if(context.spaceless > 0) {
						string = string.replace(/>\s+</g, '><').trim()
					}

					expressions.push({
						type: 'string',
						contents: string
					})
				}

				context.compile.index += match.index
				contents = contents.substring(match.index)
			}

			let args = null
			let nextIndex = 0

			if(match[2]) {
				let openCount = -1
				let index = 0
				let startIndex = 0
				let lastIndex = 0

				while(openCount !== 0 && (index = nextIndexOf(contents, [ '(', ')' ], index)) >= 0) {
					const parenthesis = contents.substring(index, index + 1)

					if(parenthesis === ')') {
						openCount--
					} else if(openCount === -1) {
						startIndex = index
						openCount = 1
					} else {
						openCount++
					}

					lastIndex = index
					index++
				}

				args = contents.substring(startIndex + 1, lastIndex)
				nextIndex = lastIndex + 1
			} else {
				nextIndex = match[0].length
			}

			context.compile.index -= 1

			const advance = () => {
				contents = contents.substring(nextIndex)
				context.compile.index += nextIndex + 1
			}

			switch(match[1]) {
				case 'extends':
					context.layout = args
					advance()
					continue
				case 'spaceless':
					context.spaceless++
					advance()
					continue
				case 'endspaceless':
					context.spaceless--
					advance()
					continue
			}

			const result = this.compileDirective(context, match[1].toLowerCase(), args)

			if(!result.isNil) {
				expressions.push({
					type: 'code',
					contents: result
				})
			}

			advance()
		}

		contents = contents.trim()

		if(contents.length > 0) {
			expressions.push({
				type: 'string',
				contents: contents
			})
		}

		let code = ''

		for(const { type, contents } of expressions) {
			if(type === 'code') {
				code += `${contents}\n`
			} else {
				code += `output += \`${sanitizeHtml(contents)}\`;\n`
			}
		}

		code = contextualize(`let output = '';\n${code}`)

		let template = `function(_, _sections = { }) {\n${code}\n`

		if(context.layout !== null) {
			template += `return _.$engine._extends(${context.layout}, _, _sections);\n}`
		} else {
			template += 'return output;\n}'
		}

		if(!shouldEval) {
			return template
		}

		template = `const template = ${template}; template`

		return eval(template)
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
