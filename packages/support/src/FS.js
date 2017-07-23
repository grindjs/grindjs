const { promisify } = require('util')
const fs = require('fs')

export const FS = { }

// Standard fs
// ----------------------------
FS.access = promisify(fs.access)
FS.rename = promisify(fs.rename)
FS.ftruncate = promisify(fs.ftruncate)
FS.chown = promisify(fs.chown)
FS.fchown = promisify(fs.fchown)
if(fs.lchown) { FS.lchown = promisify(fs.lchown) }
FS.chmod = promisify(fs.chmod)
FS.fchmod = promisify(fs.fchmod)
FS.stat = promisify(fs.stat)
FS.lstat = promisify(fs.lstat)
FS.fstat = promisify(fs.fstat)
FS.link = promisify(fs.link)
FS.symlink = promisify(fs.symlink)
FS.readlink = promisify(fs.readlink)
FS.realpath = promisify(fs.realpath)
FS.unlink = promisify(fs.unlink)
FS.rmdir = promisify(fs.rmdir)
FS.mkdir = promisify(fs.mkdir)
FS.readdir = promisify(fs.readdir)
FS.close = promisify(fs.close)
FS.open = promisify(fs.open)
FS.utimes = promisify(fs.utimes)
FS.futimes = promisify(fs.futimes)
FS.fsync = promisify(fs.fsync)
FS.fdatasync = promisify(fs.fdatasync)
FS.write = promisify(fs.write)
FS.read = promisify(fs.read)
FS.readFile = promisify(fs.readFile)
FS.writeFile = promisify(fs.writeFile)
FS.appendFile = promisify(fs.appendFile)
FS.truncate = promisify(fs.truncate)

// mkdirp
// ----------------------------
let mkdirp = null
FS.mkdirp = function(...args) {
	if(mkdirp !== null) {
		return mkdirp(...args)
	}

	mkdirp = promisify(require('mkdirp'))
	return mkdirp(...args)
}

FS.mkdirs = FS.mkdirp

// exists
// ----------------------------
FS.exists = pathname => {
	return FS.stat(pathname).then(() => true).catch(err => {
		if(err.code !== 'ENOENT') {
			throw err
		}

		return false
	})
}

// touch
// ----------------------------
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

// recursiveReaddir
// ----------------------------
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
