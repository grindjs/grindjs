const fs = require('fs')
const FS = { }

function callback(resolve, reject) {
	return function(err, result) {
		if(err) {
			return reject(err)
		}

		return resolve(result)
	}
}

// Standard fs
// ----------------------------

FS.access = function(...args) {
	return new Promise((resolve, reject) => fs.access(...args, callback(resolve, reject)))
}

FS.rename = function(...args) {
	return new Promise((resolve, reject) => fs.rename(...args, callback(resolve, reject)))
}

FS.ftruncate = function(...args) {
	return new Promise((resolve, reject) => fs.ftruncate(...args, callback(resolve, reject)))
}

FS.chown = function(...args) {
	return new Promise((resolve, reject) => fs.chown(...args, callback(resolve, reject)))
}

FS.fchown = function(...args) {
	return new Promise((resolve, reject) => fs.fchown(...args, callback(resolve, reject)))
}

FS.lchown = function(...args) {
	return new Promise((resolve, reject) => fs.lchown(...args, callback(resolve, reject)))
}

FS.chmod = function(...args) {
	return new Promise((resolve, reject) => fs.chmod(...args, callback(resolve, reject)))
}

FS.fchmod = function(...args) {
	return new Promise((resolve, reject) => fs.fchmod(...args, callback(resolve, reject)))
}

FS.stat = function(...args) {
	return new Promise((resolve, reject) => fs.stat(...args, callback(resolve, reject)))
}

FS.lstat = function(...args) {
	return new Promise((resolve, reject) => fs.lstat(...args, callback(resolve, reject)))
}

FS.fstat = function(...args) {
	return new Promise((resolve, reject) => fs.fstat(...args, callback(resolve, reject)))
}

FS.link = function(...args) {
	return new Promise((resolve, reject) => fs.link(...args, callback(resolve, reject)))
}

FS.symlink = function(...args) {
	return new Promise((resolve, reject) => fs.symlink(...args, callback(resolve, reject)))
}

FS.readlink = function(...args) {
	return new Promise((resolve, reject) => fs.readlink(...args, callback(resolve, reject)))
}

FS.realpath = function(...args) {
	return new Promise((resolve, reject) => fs.realpath(...args, callback(resolve, reject)))
}

FS.unlink = function(...args) {
	return new Promise((resolve, reject) => fs.unlink(...args, callback(resolve, reject)))
}

FS.rmdir = function(...args) {
	return new Promise((resolve, reject) => fs.rmdir(...args, callback(resolve, reject)))
}

FS.mkdir = function(...args) {
	return new Promise((resolve, reject) => fs.mkdir(...args, callback(resolve, reject)))
}

FS.readdir = function(...args) {
	return new Promise((resolve, reject) => fs.readdir(...args, callback(resolve, reject)))
}

FS.close = function(...args) {
	return new Promise((resolve, reject) => fs.close(...args, callback(resolve, reject)))
}

FS.open = function(...args) {
	return new Promise((resolve, reject) => fs.open(...args, callback(resolve, reject)))
}

FS.utimes = function(...args) {
	return new Promise((resolve, reject) => fs.utimes(...args, callback(resolve, reject)))
}

FS.futimes = function(...args) {
	return new Promise((resolve, reject) => fs.futimes(...args, callback(resolve, reject)))
}

FS.fsync = function(...args) {
	return new Promise((resolve, reject) => fs.fsync(...args, callback(resolve, reject)))
}

FS.fdatasync = function(...args) {
	return new Promise((resolve, reject) => fs.fdatasync(...args, callback(resolve, reject)))
}

FS.write = function(...args) {
	return new Promise((resolve, reject) => fs.write(...args, callback(resolve, reject)))
}

FS.read = function(...args) {
	return new Promise((resolve, reject) => fs.read(...args, callback(resolve, reject)))
}

FS.readFile = function(...args) {
	return new Promise((resolve, reject) => fs.readFile(...args, callback(resolve, reject)))
}

FS.writeFile = function(...args) {
	return new Promise((resolve, reject) => fs.writeFile(...args, callback(resolve, reject)))
}

FS.appendFile = function(...args) {
	return new Promise((resolve, reject) => fs.appendFile(...args, callback(resolve, reject)))
}

FS.truncate = function(...args) {
	return new Promise((resolve, reject) => fs.truncate(...args, callback(resolve, reject)))
}

// mkdirp
// ----------------------------
FS.mkdirp = function(...args) {
	const mkdirp = require('mkdirp')

	return new Promise((resolve, reject) => mkdirp(...args, callback(resolve, reject)))
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
