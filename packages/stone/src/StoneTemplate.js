import './Errors/StoneCompilerError'

import './Support/contextualize'
import './Support/nextIndexOf'
import './Support/sanitizeHtml'

export class StoneTemplate {
	compiler = null

	state = {
		file: null,
		contents: null,
		lines: null,
		index: 0
	}

	layout = null
	sections = [ ]

	expressions = [ ]
	spaceless = 0

	_template = null

	constructor(compiler, contents, file = null) {
		this.compiler = compiler
		this.state.contents = contents
		this.state.file = file
		this.state.lines = contents.split(/\n/).map(line => line.length)
	}

	compile() {
		// Strip comments
		let contents = this.state.contents.trim().replace(/\{\{--([\s\S]+)--\}\}/g, '')

		contents = this.advance(contents)
		contents = contents.trim()

		if(contents.length > 0) {
			this.expressions.push({
				type: 'string',
				contents: contents
			})
		}

		let code = ''

		for(const { type, contents } of this.expressions) {

			if(type === 'code') {
				code += `${contents}\n`
			} else {
				const output = sanitizeHtml(contents)
				code += `output += \`${output}\`;\n`
			}
		}

		code = contextualize(`let output = '';\n${code}`)

		this._template = `function(_, _sections = { }) {\n${code}\n`

		if(this.layout !== null) {
			this._template += `return _.$engine._extends(${this.layout}, _, _sections);\n}`
		} else {
			this._template += 'return output;\n}'
		}
	}

	advance(contents) {
		const match = contents.match(/@(\w+)([ \t]*\()?\n*/)

		if(!match) {
			return contents
		}

		if(match.index > 0) {
			let string = contents.substring(0, match.index)

			if(string.trim().length > 0) {
				if(this.spaceless > 0) {
					string = string.replace(/>\s+</g, '><').trim()
				}

				this.expressions.push({
					type: 'string',
					contents: string
				})
			}

			this.state.index += match.index
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

		this.state.index -= 1

		switch(match[1]) {
			case 'extends':
				this.layout = args
				break

			case 'spaceless':
				this.spaceless++
				break

			case 'endspaceless':
				this.spaceless--
				break

			default: {
				const result = this.compiler.compileDirective(this, match[1].toLowerCase(), args)

				if(!result.isNil) {
					this.expressions.push({
						type: 'code',
						contents: result
					})
				}
			}
		}

		contents = contents.substring(nextIndex)
		this.state.index += nextIndex + 1
		return this.advance(contents)
	}

	findLineColumn(position) {
		let line = 0
		let column = 1

		for(const length of this.state.lines) {
			line++

			if(position >= length) {
				position -= length
				continue
			}

			column = position + 1
			break
		}

		return { line, column }
	}

	toString() {
		if(typeof this._template !== 'string') {
			throw new Error('Templates must be compiled first.')
		}

		return this._template
	}

	toFunction() {
		const template = `const template = ${this.toString()}; template`
		return eval(template)
	}

}
