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
FS.lchown = promisify(fs.lchown)
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
