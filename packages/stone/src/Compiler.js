import { FS } from 'grind-support'
import './Template'

export class Compiler {
	engine = null
	directives = { }
	sectionStack = [ ]

	constructor(engine) {
		this.engine = engine
	}

	async compile(template) {
		let contents = (await FS.readFile(template)).toString().trim()
		let extendsLayout = null

		const expressions = [ ]
		let match = null

		// Loops through and finds all directives
		while((match = contents.match(/@([a-z0-9_]+)(\s*\()?/))) {
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
				extendsLayout = args
				continue
			}

			const result = this.compileDirective(match[1], args)

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

		code = `template = function(_, _sections = { }) {\nlet output = '';\n${Template.contextualize(code)}\n`

		if(extendsLayout !== null) {
			code += `return _.$compiler._extends(${extendsLayout}, _, _sections);\n}`
		} else {
			code += `return output;\n}`
		}

		return eval(code)
	}

	_extends(template, context, sections) {
		return this.compile(this.engine.resolve(template)).then(template => template(context, sections))
	}

	compileDirective(name, args) {
		if(name === 'directive') {
			// Avoid infinite loop
			return null
		}

		if(typeof this.directives[name] === 'function') {
			return this.directives[name](args)
		}

		return this[`compile${name[0].toUpperCase()}${name.substring(1)}`](args)
	}

	compileIf(condition) {
		return `if(${condition}) {`
	}

	compileElseif(condition) {
		return `} else if(${condition}) {`
	}

	compileElse() {
		return '} else {'
	}

	compileEndif() {
		return this.compileEnd()
	}

	compileFor(args) {
		return `for(${args}) {`
	}

	compileEndfor() {
		return this.compileEnd()
	}

	compileWhile(condition) {
		return `while(${condition}) {`
	}

	compileEndwhile() {
		return this.compileEnd()
	}

	compileEnd() {
		return '}'
	}

	compileSection(args) {
		if(args.indexOf(',') === -1) {
			this.sectionStack.push(args)
			return this._compileSection(args, `function() {\nlet output = '';`)
		}

		args = args.split(/,/)

		if(args.length !== 2) {
			throw new Error('Invalid section block')
		}

		return this._compileSection(args[0], `function() { return ${args[1]}; })`)
	}

	_compileSection(name, code) {
		return `(_sections[${name}] = (_sections[${name}] || [ ])).unshift(${code}\n`
	}

	/**
	 * Ends the current section and returns output
	 * @return {string} Output from the section
	 */
	compileEndsection() {
		this.sectionStack.pop()
		return 'return output;\n})'
	}

	/**
	 * Compiles the yield directive to output a section
	 *
	 * @param  {string} section Name of the section to yield
	 * @return {string}         Code to render the section
	 */
	compileYield(section) {
		return `output += _sections[${section}].length > 0 ? (_sections[${section}].pop())() : ''`
	}

	/**
	 * Renders content from the section section
	 * @return {string} Code to render the super section
	 */
	compileSuper() {
		// Due to how sections work, we can cheat by just calling yeild
		// which will pop off the next chunk of content in this section
		// and render it within ours
		return this.compileYield(this.sectionStack[this.sectionStack.length - 1])
	}

	/**
	 * Alias of compileSuper for compatibility with Blade
	 * @return {string} Code to render the super section
	 */
	compileParent() {
		return this.compileSuper()
	}

}
