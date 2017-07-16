let FS = null

if(Number.parseFloat(process.version.substring(1)) >= 8) {
	FS = { ...require('./FS/Promisify.js').FS }
} else {
	FS = { ...require('./FS/Legacy.js').FS }
}

FS.mkdirs = FS.mkdirp

// Additional functionality
// ----------------------------

FS.exists = pathname => {
	return FS.stat(pathname).then(() => true).catch(err => {
		if(err.code !== 'ENOENT') {
			throw err
		}

		return false
	})
}

FS.touch = (path, time) => {
	time = time || Date.now()
	let fd = null

	return FS.open(path, 'r').then(fdd => {
		fd = fdd
	}).then(() => {
		return FS.futimes(fd, time, time)
	}).catch(err => {
		if(!fd.isNil) {
			return FS.close(fd).then(() => {
				fd = null
				throw err
			})
		}

		throw err
	}).then(result => {
		if(!fd.isNil) {
			return FS.close(fd).then(() => {
				fd = null
				return result
			})
		}

		return result
	})
}

FS.recursiveReaddir = pathname => {
	const recursiveReaddir = require('recursive-readdir')

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
