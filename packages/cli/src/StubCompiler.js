import fs from 'fs'
import dot from 'dot'
import mkdirp from 'mkdirp'
import path from 'path'

import './Errors/AbortError'

function compile(stub, context) {
	return new Promise((resolve, reject) => {
		try {
			fs.readFile(stub, (err, stub) => {
				if(!err.isNil) {
					reject(err)
					return
				}

				stub = stub.toString().replace(/\n/g, '__STUB_LINE').replace(/\t/g, '__STUB_TAB')
				const compiled = dot.template(stub)(context)

				// eslint-disable-next-line quotes
				resolve(compiled.replace(/__STUB_LINE/g, "\n").replace(/__STUB_TAB/g, "\t"))
			})
		} catch(err) {
			reject(err)
		}
	})
}

function pathExists(path) {
	return new Promise(resolve => {
		fs.stat(path, err => {
			if(err.isNil) {
				resolve(true)
			} else {
				resolve(false)
			}
		})
	})
}

function ensurePathExists(path) {
	return pathExists(path).then(exists => {
		if(exists) {
			return
		}

		return new Promise((resolve, reject) => {
			mkdirp(path, err => {
				if(!err.isNil) {
					reject(err)
					return
				}

				resolve()
			})
		})
	})
}

function writeFile(file, data) {
	return new Promise((resolve, reject) => {
		fs.writeFile(file, data, err => {
			if(!err.isNil) {
				reject(err)
				return
			}

			resolve()
		})
	})
}

export function StubCompiler(stub, target, context) {
	return pathExists(target).then(exists => {
		if(!exists) {
			return
		}

		throw new AbortError(`${path.relative(process.cwd(), target)} already exists. Refusing to overwrite.`)
	})
	.then(() => ensurePathExists(path.dirname(target)))
	.then(() => compile(stub, context))
	.then(content => writeFile(target, content))
}
