/* eslint-disable max-lines */
import './AST'
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

			switch(match[1]) {
				case 'extends':
					context.layout = args
					continue
				case 'spaceless':
					context.spaceless++
					continue
				case 'endspaceless':
					context.spaceless--
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

		code = Template.contextualize(`let output = '';\n${code}`)

		let template = `function(_, _sections = { }) {\n${code}\n`

		if(context.layout !== null) {
			template += `return _.$compiler._extends(${context.layout}, _, _sections);\n}`
		} else {
			template += 'return output;\n}'
		}

		if(!shouldEval) {
			return template
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

	compileEndif(context) {
		return this.compileEnd(context)
	}

	compileUnless(context, condition) {
		return `if(!${condition}) {`
	}

	compileEndunless(context) {
		return this.compileEnd(context)
	}

	compileFor(context, args) {
		return `for(${args}) {`
	}

	compileEndfor(context) {
		return this.compileEnd(context)
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

	compileEndwhile(context) {
		return this.compileEnd(context)
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

		return this._compileSection(context, args[0], `function() { return escape(${args[1]}); });`)
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
		return `${this.compileEndsection(context)};\n${this.compileYield(context, section)}`
	}

	/**
	 * Compiles the yield directive to output a section
	 *
	 * @param  {object} context Context for the compilation
	 * @param  {string} section Name of the section to yield
	 * @return {string}         Code to render the section
	 */
	compileYield(context, section) {
		let code = ''

		if(section.indexOf(',') >= 0) {
			const sectionName = section.split(/,/)[0]
			code = `${this.compileSection(context, section)}\n`
			section = sectionName
		}

		return `${code}output += (_sections[${section}] || [ ]).length > 0 ? (_sections[${section}].pop())() : ''`
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

	/**
	 * Renders content from a subview
	 *
	 * @param  {object} context Context for the compilation
	 * @param  {string} view    Subview to include
	 * @return {string} Code to render the subview
	 */
	compileInclude(context, view) {
		return `output += (_.$compiler._include(_, _sections, ${view}));\n`
	}

	/**
	 * Sets a context variable
	 *
	 * @param  {object} context Context for the compilation
	 * @param  {string} args    Arguments to set
	 * @return {string} Code to set the context variable
	 */
	compileSet(context, args) {
		if(args.indexOf(',') === -1) {
			// If there’s no commas, this is a simple raw code block
			return `${args};`
		}

		// If there are commas, we need to determine if
		// the comma is at the top level or if it‘s inside
		// an object, array or function call to determine
		// the intended behavior
		const open = {
			'[': 0,
			'(': 0,
			'{': 0,
			first: true
		}

		const openCount = () => {
			if(open.first) {
				delete open.first
				return -1
			}

			return Object.values(open).reduce((a, b) => a + b, 0)
		}

		const set = [ '(', ')', '{', '}', '[', ']', ',' ]
		let index = 0

		while(openCount() !== 0 && (index = Template.nextIndexOf(args, set, index)) >= 0) {
			const character = args.substring(index, index + 1)

			switch(character) {
				case '(':
					open['(']++
					break
				case ')':
					open['(']--
					break
				case '{':
					open['{']++
					break
				case '}':
					open['{']--
					break
				case '[':
					open['[']++
					break
				case ']':
					open['[']--
					break
				default:
					break
			}

			index++

			if(character === ',' && openCount() === 0) {
				break
			}
		}

		const lhs = args.substring(0, index).trim().replace(/,$/, '')
		const rhs = args.substring(index).trim().replace(/^,/, '')

		if(rhs.length === 0) {
			return `${lhs};`
		}

		// If var type has been explicitly defined, we’ll
		// pass through directly and scope locally
		if(lhs.startsWith('const ') || lhs.startsWith('let ')) {
			return `${lhs} = ${rhs};`
		}

		// Otherwise, scoping is assumed to be on the context var
		if(lhs[0] !== '{' && lhs[0] !== '[') {
			// If we‘re not destructuring, we can just assign it
			// directly on the context var and bail out early
			return `_.${lhs} = ${rhs};`
		}

		// If we are destructuring, we need to find the vars to extract
		// then wrap them in a function and assign them to the context var
		const code = `const ${lhs} = ${rhs};`
		const tree = AST.parse(code)
		const extracted = [ ]

		if(tree.body.length > 1 || tree.body[0].type !== 'VariableDeclaration')  {
			throw new Error('Unexpected variable assignment.')
		}

		const extract = node => {
			if(node.type === 'ArrayPattern') {
				for(const element of node.elements) {
					extract(element)
				}
			} else if(node.type === 'ObjectPattern') {
				for(const property of node.properties) {
					extract(property.value)
				}
			} else {
				extracted.push(node.name)
			}
		}

		for(const declaration of tree.body[0].declarations) {
			extract(declaration.id)
		}

		return `Object.assign(_, (function() {\n\t${code}\n\treturn { ${extracted.join(', ')} };\n})());`
	}

	/**
	 * Displays the contents of an object or value
	 *
	 * @param  {object} context Context for the compilation
	 * @param  {mixed}  value   Object or value to display
	 * @return {string} Code to display the contents
	 */
	compileDump(context, value) {
		return `output += \`<pre>\${escape(stringify(${value}, null, '  '))}</pre>\``
	}

}
