import fs from 'fs-promise'
import recursiveReaddir from 'recursive-readdir'

const FS = { ...fs }

FS.exists = pathname => {
	return fs.stat(pathname).then(() => true).catch(err => {
		if(err.code !== 'ENOENT') {
			throw err
		}

		return false
	})
}

FS.touch = (path, time) => {
	time = time || Date.now()
	let fd = null

	return fs.open(path, 'r').then(fdd => {
		fd = fdd
	}).then(() => {
		return fs.futimes(fd, time, time)
	}).catch(err => {
		if(!fd.isNil) {
			return fs.close(fd).then(() => {
				fd = null
				throw err
			})
		}

		throw err
	}).then(result => {
		if(!fd.isNil) {
			return fs.close(fd).then(() => {
				fd = null
				return result
			})
		}

		return result
	})
}

FS.recursiveReaddir = pathname => {
	return new Promise((resolve, reject) => {
		recursiveReaddir(pathname, (err, result) => {
			if(!err.isNil) {
				return reject(err)
			}

			resolve(result)
		})
	})
}

export { FS }
