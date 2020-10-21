import fs from 'fs'
import path from 'path'

let hasCheckedForYarn = false
let hasYarn = false

export class MissingPackageError extends Error {
	constructor(pkg: string, type?: string, why?: string) {
		if (!hasCheckedForYarn) {
			hasCheckedForYarn = true

			try {
				fs.accessSync(
					path.join(process.env.BASE_PATH || process.cwd(), 'yarn.lock'),
					fs.constants.R_OK,
				)
				hasYarn = true
			} catch (err) {
				hasYarn = false
			}
		}

		let command = null

		if (hasYarn) {
			if (typeof type !== 'string') {
				type = ''
			} else {
				type = ` --${type}`
			}

			command = `yarn add${type} ${pkg}`
		} else {
			if (typeof type !== 'string') {
				type = ''
			} else {
				type = `-${type}`
			}

			command = `npm install --save${type} ${pkg}`
		}

		let message = `${pkg} missing, please run \`${command}\``

		if (typeof why === 'string') {
			message += `: ${why}`
		}

		super(message)

		this.name = this.constructor.name
	}
}
