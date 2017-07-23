const fs = require('fs')
const path = require('path')

let hasCheckedForYarn = false
let hasYarn = false

export class MissingPackageError extends Error {

	constructor(pkg, type = null, why = null) {
		if(!hasCheckedForYarn) {
			hasCheckedForYarn = true

			try {
				// eslint-disable-next-line no-sync
				fs.accessSync(path.join(process.env.BASE_PATH || process.cwd(), 'yarn.lock'), 'R_OK')
				hasYarn = true
			} catch(err) {
				hasYarn = false
			}
		}

		let command = null

		if(hasYarn) {
			if(type.isNil) {
				type = ''
			} else {
				type = ` --${type}`
			}

			command = `yarn add${type} ${pkg}`
		} else {
			if(type.isNil) {
				type = ''
			} else {
				type = `-${type}`
			}

			command = `npm install --save${type} ${pkg}`
		}

		let message = `${pkg} missing, please run \`${command}\``

		if(typeof why === 'string') {
			message += `: ${why}`
		}

		super(message)

		this.name = this.constructor.name
	}

}
