import './Errors/StoneCompilerError'
import './Errors/StoneSyntaxError'

import './AST'
import './Support/contextualize'
import './Support/nextIndexOf'

export class StoneTemplate {
	compiler = null

	state = {
		file: null,
		contents: null,
		lines: null,
		index: 0
	}

	layout = null
	layoutIndex = null
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
		// TODO: This is going to break source maps
		let contents = this.state.contents.trim().replace(/\{\{--([\s\S]+)--\}\}/g, '')

		contents = this.advance(contents)
		contents = contents.trim()

		if(contents.length > 0) {
			this.expressions.push({
				type: 'string',
				contents: contents,
				index: this.state.index
			})
		}

		let code = ''

		for(const { type, contents, index } of this.expressions) {
			if(type === 'code') {
				code += `${contents}\n`
			} else {
				const output = this.finalizeOutput(contents, index)
				code += `output += ${output}\n`
			}
		}


		code = `function template(_, _sections = { }) {\nlet output = '';\n${code}\n`

		if(this.layout !== null) {
			code += `return _.$engine._extends(${this.layout}, _, _sections);\n}`
		} else {
			code += 'return output;\n}'
		}

		this._template = contextualize(code)
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
					contents: string,
					index: this.state.index
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
				if(typeof this.layout === 'string') {
					throw new StoneCompilerError(this, '@extends may only be called once per view.')
				}

				this.layout = args
				this.layoutIndex = this.state.index
				break

			case 'spaceless':
				this.spaceless++
				break

			case 'endspaceless':
				this.spaceless--

				if(this.spaceless < 0) {
					throw new StoneCompilerError(this, 'Unbalanced calls to @endspaceless')
				}

				break

			default: {
				const result = this.compiler.compileDirective(this, match[1].toLowerCase(), args)

				if(!result.isNil) {
					this.expressions.push({
						type: 'code',
						contents: result,
						index: this.state.index
					})
				}
			}
		}

		contents = contents.substring(nextIndex)
		this.state.index += nextIndex + 1
		return this.advance(contents)
	}

	/**
	 * Finalizes an output block by replacing white space
	 * and converting output tags to placeholders for
	 * use within template literals
	 *
	 * @param  {string} output      Raw output
	 * @param  {number} sourceIndex Index in the source file this occurs
	 * @return {string}             Finalized output
	 */
	finalizeOutput(output, sourceIndex) {
		const placeholders = { }
		let placeholderOrdinal = 0

		// Store regular output blocks
		output = output.replace(/(^|[^@])\{\{\s*([\s\S]+?)\s*\}\}/gm, ($0, $1, $2) => {
			const placeholder = `@@__stone_placeholder_${++placeholderOrdinal}__@@`
			placeholders[placeholder] = `\${escape(${$2})}`
			return `${$1}${placeholder}`
		})

		// Strip escaped braces
		output = output.replace(/@\{\{([\s\S]+?)\}\}/gm, '{{$1}}')

		// Store raw output blocks
		output = output.replace(/\{!!\s*([\s\S]+?)\s*!!\}/gm, ($0, $1) => {
			const placeholder = `@@__stone_placeholder_${++placeholderOrdinal}__@@`
			placeholders[placeholder] = `\${${$1}}`
			return placeholder
		})

		// Escape escape characters
		output = output.replace(/\\/g, '\\\\')

		// Escape backticks
		output = output.replace(/`/g, '\\`')

		// Escape whitespace characters
		output = output.replace(/[\n]/g, '\\n')
		output = output.replace(/[\r]/g, '\\r')
		output = output.replace(/[\t]/g, '\\t')

		// Restore placeholders
		for(const [ placeholder, content ] of Object.entries(placeholders)) {
			output = output.replace(placeholder, content)
		}

		return this.validateSyntax(`\`${output}\`;`, sourceIndex)
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

	validateSyntax(code, position) {
		try {
			AST.parse(code)
		} catch(err) {
			if(err instanceof SyntaxError) {
				throw new StoneSyntaxError(this, err, position || this.state.index)
			}

			throw err
		}

		return code
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
