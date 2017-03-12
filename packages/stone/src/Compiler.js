import './Template'

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
		compiled = this.compileString(fs.readFileSync(template).toString())
		this.compiled[template] = compiled

		return compiled
	}

	compileString(contents, shouldEval = true) {
		const context = {
			sections: [ ],
			layout: null
		}

		// Strip comments
		contents = contents.trim().replace(/\{\{--([\s\S]+)--\}\}/g, '')

		// Loop through and find all directives
		const expressions = [ ]
		let match = null

		while((match = contents.match(/@([a-zA-Z0-9_]+)(\s*\()?/))) {
			if(match.index > 0) {
				expressions.push({
					type: 'string',
					contents: contents.substring(0, match.index)
				})

				contents = contents.substring(match.index)
			}

			let args = null

			if(match[2]) {
				let openCount = -1
				let index = 0
				let startIndex = 0
				let lastIndex = 0

				while(openCount !== 0 && (index = Template.nextIndexOfParenthesis(contents, index)) >= 0) {
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
				contents = contents.substring(lastIndex + 1)
			} else {
				contents = contents.substring(match[0].length)
			}

			if(match[1] === 'extends') {
				context.layout = args
				continue
			}

			const result = this.compileDirective(context, match[1].toLowerCase(), args)

			if(!result.isNil) {
				expressions.push({
					type: 'code',
					contents: result
				})
			}
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
				code += `output += \`${Template.sanitizeHtml(contents)}\`;\n`
			}
		}

		code = Template.contextualize(code)

		let template = `function(_, _sections = { }) {\nlet output = '';\n${code}\n`

		if(context.layout !== null) {
			template += `return _.$compiler._extends(${context.layout}, _, _sections);\n}`
		} else {
			template += `return output;\n}`
		}

		if(!shouldEval) {
			return code
		}

		template = `const template = ${template}; template`

		return eval(template)
	}

	_extends(template, context, sections) {
		return (this.compile(this.engine.resolve(template)))(context, sections)
	}

	_include(context, sections, template, extra) {
		if(extra) {
			context = { ...context, ...extra }
		}

		return (this.compile(this.engine.resolve(template)))(context, sections)
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
			throw new Error(`@${name} is not a valid Stone directive.`)
		}

		return this[method](context, args)
	}

	compileIf(context, condition) {
		return `if(${condition}) {`
	}

	compileElseif(context, condition) {
		return `} else if(${condition}) {`
	}

	compileElse() {
		return '} else {'
	}

	compileEndif() {
		return this.compileEnd()
	}

	compileUnless(context, condition) {
		return `if(!${condition}) {`
	}

	compileEndunless() {
		return this.compileEnd()
	}

	compileFor(context, args) {
		return `for(${args}) {`
	}

	compileEndfor() {
		return this.compileEnd()
	}

	/**
	 * Generate continue code that optionally has a condition
	 * associated with it.
	 *
	 * @param  {object} context   Context for the compilation
	 * @param  {string} condition Optional condition to continue on
	 * @return {string}           Code to continue
	 */
	compileContinue(context, condition) {
		if(condition.isNil) {
			return 'continue;'
		}

		return `if(${condition}) { continue; }`
	}

	/**
	 * Generate break code that optionally has a condition
	 * associated with it.
	 *
	 * @param  {object} context   Context for the compilation
	 * @param  {string} condition Optional condition to break on
	 * @return {string}           Code to break
	 */
	compileBreak(context, condition) {
		if(condition.isNil) {
			return 'break;'
		}

		return `if(${condition}) { break; }`
	}

	compileWhile(context, condition) {
		return `while(${condition}) {`
	}

	compileEndwhile() {
		return this.compileEnd()
	}

	compileEnd() {
		return '}'
	}

	compileSection(context, args) {
		if(args.indexOf(',') === -1) {
			context.sections.push(args)
			return this._compileSection(context, args, `function() {\nlet output = '';`)
		}

		args = args.split(/,/)

		if(args.length !== 2) {
			throw new Error('Invalid section block')
		}

		return this._compileSection(context, args[0], `function() { return ${args[1]}; });`)
	}

	_compileSection(context, name, code) {
		return `(_sections[${name}] = (_sections[${name}] || [ ])).unshift(${code}\n`
	}

	/**
	 * Ends the current section and returns output
	 * @return {string} Output from the section
	 */
	compileEndsection(context) {
		context.sections.pop()
		return 'return output;\n});'
	}

	/**
	 * Ends the current section and yields it for display
	 * @return {string} Output from the section
	 */
	compileShow(context) {
		const section = context.sections[context.sections.length - 1]
		return `${this.compileEndsection(context)};\n${this.compileYield(section)}`
	}

	/**
	 * Compiles the yield directive to output a section
	 *
	 * @param  {object} context Context for the compilation
	 * @param  {string} section Name of the section to yield
	 * @return {string}         Code to render the section
	 */
	compileYield(context, section) {
		return `output += (_sections[${section}] || [ ]).length > 0 ? (_sections[${section}].pop())() : ''`
	}

	/**
	 * Renders content from the section section
	 * @return {string} Code to render the super section
	 */
	compileSuper(context) {
		// Due to how sections work, we can cheat by just calling yeild
		// which will pop off the next chunk of content in this section
		// and render it within ours
		return this.compileYield(context, context.sections[context.sections.length - 1])
	}

	/**
	 * Alias of compileSuper for compatibility with Blade
	 * @return {string} Code to render the super section
	 */
	compileParent(context) {
		return this.compileSuper(context)
	}

	/**
	 * Convenience directive to determine if a section has content
	 * @return {string} If statement that determines if a section has content
	 */
	compileHassection(context, section) {
		return `if((_sections[${section}] || [ ]).length > 0) {`
	}

	compileInclude(context, args) {
		return `output += (_.$compiler._include(_, _sections, ${args}));\n`
	}

}
