import { FS } from 'grind-support'
import path from 'path'

import './Errors/AbortError'

export function StubCompiler(stub, target, context) {
	// Check if the target already exists
	return FS.exists(target).then(exists => {
		if(!exists) {
			return
		}

		throw new AbortError(`${path.relative(process.cwd(), target)} already exists. Refusing to overwrite.`)
	})

	// Make sure the path exists
	.then(() => FS.exists(path.dirname(target))).then(exists => {
		if(exists) {
			return
		}

		return FS.mkdirp(path.dirname(target))
	})

	// Compile the stub
	.then(() => FS.readFile(stub)).then(stub => {
		const entries = Object.entries(context).sort((a, b) => {
			a = a[0].length
			b = b[0].length

			return a === b ? 0 : (a < b ? 1 : -1)
		})

		let template = stub.toString()

		for(const [ key, value ] of entries) {
			template = template.replace(new RegExp(key, 'g'), value)
		}

		return template
	})

	// Write the target
	.then(content => FS.writeFile(target, content))
}
