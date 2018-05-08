export class StoneRuntime {

	engine = null

	constructor(engine) {
		this.engine = engine
	}

	extends(fromTemplate, template, context, sections) {
		return (this.compiler.compile(this.engine.resolve(template, fromTemplate)))(context, sections)
	}

	include(context, sections, fromTemplate, template, extra) {
		if(extra) {
			context = { ...context, ...extra, $local: { ...extra } }
		} else {
			context = { ...context, $local: { } }
		}

		const compiled = this.compiler.compile(this.engine.resolve(template, fromTemplate))

		if(compiled.isLayout) {
			// Don’t pass through sections if including another layout
			return compiled(context)
		}

		return compiled(context, sections)
	}

	each(context, fromTemplate, template, collection, key, empty = 'raw|', extra = { }) {
		let length = 0
		let isObject = false

		// Determine if we have an object or an array
		if(!collection.isNil && typeof collection === 'object') {
			collection = Object.entries(collection)
			isObject = true
			length = collection.length
		} else if(Array.isArray(collection)) {
			length = collection.length
		}

		// If our collection is empty, bail out and render `empty`
		if(length === 0) {
			if(empty.substring(0, 4) === 'raw|') {
				return empty.substring(4)
			}

			// If the value of empty doesn’t start with `raw|`, we render it as a template
			return this.compiler.compile(this.engine.resolve(empty, fromTemplate))({ ...context, ...extra })
		}

		let output = ''
		const compiled = this.compiler.compile(this.engine.resolve(template, fromTemplate))

		if(isObject) {
			for(const value of collection) {
				output += compiled({
					...context,
					...extra,
					key: value[0],
					[key]: value[1]
				})
			}
		} else {
			for(const value of collection) {
				output += compiled({
					...context,
					...extra,
					[key]: value
				})
			}
		}

		return output
	}

	stackRender(context, name) {
		if(context.$stacks.isNil) {
			return ''
		}

		const stack = context.$stacks[name]

		if(stack.isNil) {
			return ''
		}

		delete context.$stacks

		return stack.join('')
	}

	stackPush(context, stack, value) {
		context.$stacks = context.$stacks || { }
		{ (context.$stacks[stack] = context.$stacks[stack] || [ ]).push(value) }
	}

	stackPrepend(context, stack, value) {
		context.$stacks = context.$stacks || { }
		{ (context.$stacks[stack] = context.$stacks[stack] || [ ]).unshift(value) }
	}

	get compiler() {
		return this.engine.compiler
	}

}
