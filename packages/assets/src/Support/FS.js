import fs from 'fs'

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

	static readFile(path) {
		return new Promise((resolve, reject) => {
			fs.readFile(path, (err, content) => {
				if(!err.isNil) {
					return reject(err)
				}

				resolve(content)
			})
		})
	}

}
