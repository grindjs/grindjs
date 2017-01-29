import { FS } from 'grind-support'
import dot from 'dot'
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
		stub = stub.toString().replace(/\n/g, '__STUB_LINE').replace(/\t/g, '__STUB_TAB')

		return dot.template(stub)(context).replace(/__STUB_LINE/g, '\n').replace(/__STUB_TAB/g, '\t')
	})

	// Write the target
	.then(content => FS.writeFile(target, content))
}
