import fs from 'fs-promise'

const FS = { ...fs }

FS.exists = pathname => {
	return fs.stat(pathname).then(() => true).catch(err => {
		if(err.code !== 'ENOENT') {
			throw err
		}

		return false
	})
}

export { FS }
