import { FS } from 'grind-support'
import './Template'

export class Stone {
	viewsPath = null

	context = {
		escape: Template.escape,
	}

	constructor(viewsPath) {
		this.viewsPath = viewsPath
	}

	async compile(template) {
		let contents = (await FS.readFile(template)).toString().trim()
		let extendsLayout = null

		const expressions = [ ]
		let match = null

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

			const method = `compile${match[1][0].toUpperCase()}${match[1].substring(1)}`
			const result = this[method](args)

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
			code += `return _.$engine._extends(${extendsLayout}, _, _sections);\n}`
		} else {
			code += `return output;\n}`
		}

		return eval(code)
	}

	render(template, context) {
		return this.compile(this.resolve(template)).then(template => template({
			...this.context,
			...context,
			$engine: this
		}))
	}

	_extends(template, context, sections) {
		return this.compile(this.resolve(template)).then(template => template(context, sections))
	}

	resolve(template) {
		return `${this.viewsPath}/${template.replace(/\./g, '/')}.stone`
	}

	compileIf(args) {
		return `if(${args}) {`
	}

	compileElseif(args) {
		return `} else if(${args}) {`
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

	compileWhile(args) {
		return `while(${args}) {`
	}

	compileEndwhile() {
		return this.compileEnd()
	}

	compileEnd() {
		return '}'
	}

	compileSection(args) {
		if(args.indexOf(',') === -1) {
			return `_sections[${args}] = function() {\nlet output = '';\n`
		}

		args = args.split(/,/)

		if(args.length !== 2) {
			throw new Error('Invalid section block')
		}

		return `_sections[${args[0]}] = function() { return ${args[1]}; }\n`
	}

	compileEndsection() {
		return 'return output;\n}'
	}

	compileYield(section) {
		return `output += typeof _sections[${section}] === 'function' ? _sections[${section}]() : ''`
	}

}
