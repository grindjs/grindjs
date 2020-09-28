import nodefs from 'fs'
import { promisify } from 'util'

export const FS = Object.freeze({
	// Standard fs
	// ----------------------------
	access: promisify(nodefs.access),
	rename: promisify(nodefs.rename),
	ftruncate: promisify(nodefs.ftruncate),
	chown: promisify(nodefs.chown),
	fchown: promisify(nodefs.fchown),
	lchown: promisify(nodefs.lchown),
	chmod: promisify(nodefs.chmod),
	fchmod: promisify(nodefs.fchmod),
	stat: promisify(nodefs.stat),
	lstat: promisify(nodefs.lstat),
	fstat: promisify(nodefs.fstat),
	link: promisify(nodefs.link),
	symlink: promisify(nodefs.symlink),
	readlink: promisify(nodefs.readlink),
	realpath: promisify(nodefs.realpath),
	unlink: promisify(nodefs.unlink),
	rmdir: promisify(nodefs.rmdir),
	mkdir: promisify(nodefs.mkdir),
	readdir: promisify(nodefs.readdir),
	close: promisify(nodefs.close),
	open: promisify(nodefs.open),
	utimes: promisify(nodefs.utimes),
	futimes: promisify(nodefs.futimes),
	fsync: promisify(nodefs.fsync),
	fdatasync: promisify(nodefs.fdatasync),
	write: promisify(nodefs.write),
	read: promisify(nodefs.read),
	readFile: promisify(nodefs.readFile),
	writeFile: promisify(nodefs.writeFile),
	appendFile: promisify(nodefs.appendFile),
	truncate: promisify(nodefs.truncate),

	// mkdirp
	// ----------------------------

	async mkdirp(pathname: string, opts?: any) {
		const { default: mkdirp } = await import('mkdirp')
		return mkdirp(pathname, opts)
	},

	mkdirs(pathname: string, opts?: any) {
		return this.mkdirp(pathname, opts)
	},

	// exists
	// ----------------------------
	exists(pathname: string) {
		return FS.stat(pathname)
			.then(() => true)
			.catch(err => {
				if (err.code !== 'ENOENT' && err.code !== 'ENOTDIR') {
					throw err
				}

				return false
			})
	},

	// touch
	// ----------------------------
	async touch(pathname: string, time?: number) {
		time = time ?? Date.now()
		let fd = null

		try {
			fd = await FS.open(pathname, 'r')
			await FS.futimes(fd, time, time)
		} finally {
			if (fd) {
				await FS.close(fd).catch(error => {})
			}
		}
	},

	// recursiveReaddir
	// ----------------------------
	async recursiveReaddir(pathname: string) {
		const { default: recursiveReaddir } = await import('recursive-readdir')

		return new Promise((resolve, reject) => {
			recursiveReaddir(pathname, (err, result) => {
				if (err) {
					return reject(err)
				}

				resolve(result)
			})
		})
	},
})
