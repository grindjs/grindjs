import fs from 'fs'
import mkdirp from 'mkdirp'

export class FS {

	static exists(pathname) {
		return this.stat(pathname).then(() => true).catch(() => false)
	}

	static stat(pathname) {
		return new Promise((resolve, reject) => {
			fs.stat(pathname, (err, stats) => {
				if(!err.isNil) {
					return reject(err)
				}

				resolve(stats)
			})
		})
	}

	static writeFile(path, data, options) {
		return new Promise((resolve, reject) => {
			fs.writeFile(path, data, options || { }, (err, content) => {
				if(!err.isNil) {
					return reject(err)
				}

				resolve(content)
			})
		})
	}

	static mkdirp(path, options) {
		return new Promise((resolve, reject) => {
			mkdirp(path, options || { }, (err, result) => {
				if(!err.isNil) {
					return reject(err)
				}

				resolve(result)
			})
		})
	}

	static unlink(path) {
		return new Promise((resolve, reject) => {
			fs.unlink(path, (err, result) => {
				if(!err.isNil) {
					return reject(err)
				}

				resolve(result)
			})
		})
	}

}
