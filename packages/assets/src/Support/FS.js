import fs from 'fs'
import recursiveReaddir from 'recursive-readdir'
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

	static recursiveReaddir(path) {
		return new Promise((resolve, reject) => {
			recursiveReaddir(path, (err, result) => {
				if(!err.isNil) {
					return reject(err)
				}

				resolve(result)
			})
		})
	}

	static rmdir(dir) {
		return new Promise((resolve, reject) => {
			fs.rmdir(dir, (err, result) => {
				if(!err.isNil) {
					return reject(err)
				}

				resolve(result)
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

	static open(path, mode) {
		return new Promise((resolve, reject) => {
			fs.open(path, mode, (err, fd) => {
				if(!err.isNil) {
					return reject(err)
				}

				resolve(fd)
			})
		})
	}

	static close(fd) {
		return new Promise((resolve, reject) => {
			fs.close(fd, (err, result) => {
				if(!err.isNil) {
					return reject(err)
				}

				resolve(result)
			})
		})
	}

	static touch(path, time) {
		time = time || Date.now()
		let fd = null

		return this.open(path, 'r').then(fdd => {
			fd = fdd
		}).then(() => {
			return new Promise((resolve, reject) => {
				fs.futimes(fd, time, time, (err, result) => {
					if(!err.isNil) {
						return reject(err)
					}

					resolve(result)
				})
			})
		}).catch(err => {
			if(!fd.isNil) {
				return this.close(fd).then(() => {
					fd = null
					throw err
				})
			}

			throw err
		}).then(result => {
			if(!fd.isNil) {
				return this.close(fd).then(() => {
					fd = null
					return result
				})
			}

			return result
		})
	}

}
