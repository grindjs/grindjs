import './Support/contextualize'
import './Support/nextIndexOf'
import './Support/sanitizeHtml'

export class StoneTemplate {
	file = null
	contents = null
	lines = null
	state = {
		index: 0
	}
	expressions = [ ]

	layout = null
	sections = [ ]
	spaceless = 0
	_templated = null

	constructor(contents, file = null) {
		this.contents = contents
		this.file = file
		this.lines = contents.split(/\n/).map(line => line.length)
	}

	compile(compiler) {
		// Strip comments
		let contents = this.contents.trim().replace(/\{\{--([\s\S]+)--\}\}/g, '')

		// Loop through and find all directives
		const expressions = [ ]
		let match = null

		while((match = contents.match(/@(\w+)([ \t]*\()?\n*/))) {
			if(match.index > 0) {
				let string = contents.substring(0, match.index)

				if(string.trim().length > 0) {
					if(this.spaceless > 0) {
						string = string.replace(/>\s+</g, '><').trim()
					}

					expressions.push({
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

			const advance = () => {
				contents = contents.substring(nextIndex)
				this.state.index += nextIndex + 1
			}

			switch(match[1]) {
				case 'extends':
					this.layout = args
					advance()
					continue

				case 'spaceless':
					this.spaceless++
					advance()
					continue

				case 'endspaceless':
					this.spaceless--
					advance()
					continue
			}

			const result = compiler.compileDirective(this, match[1].toLowerCase(), args)

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

		this._template = `function(_, _sections = { }) {\n${code}\n`

		if(this.layout !== null) {
			this._template += `return _.$engine._extends(${this.layout}, _, _sections);\n}`
		} else {
			this._template += 'return output;\n}'
		}
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
