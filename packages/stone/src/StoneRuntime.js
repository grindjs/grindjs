export class StoneRuntime {

	engine = null

	constructor(engine) {
		this.engine = engine
	}

	extends(template, context, sections) {
		return (this.compiler.compile(this.engine.resolve(template)))(context, sections)
	}

	include(context, sections, template, extra) {
		if(extra) {
			context = { ...context, ...extra }
		}

		const compiled = this.compiler.compile(this.engine.resolve(template))

		if(compiled.isLayout) {
			// Don’t pass through sections if including another layout
			return compiled(context)
		}

		return compiled(context, sections)
	}

	each(context, template, collection, key, empty = 'raw|', extra = { }) {
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
			return this.compiler.compile(this.engine.resolve(empty))({ ...context, ...extra })
		}

		let output = ''
		const compiled = this.compiler.compile(this.engine.resolve(template))

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

	get compiler() {
		return this.engine.compiler
	}

}
