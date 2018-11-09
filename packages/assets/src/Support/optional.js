import { MissingPackageError } from 'grind-framework'

const loadOptional = require('optional')
const semver = require('semver')

export function optional(pkgName, version = null) {
	return {
		pkg: null,
		name: pkgName,
		resolved: null,

		assert() {
			return this.resolve(true)
		},

		resolve(isFatal = false) {
			if(typeof this.resolved === 'boolean') {
				return this.resolved
			}

			this.pkg = loadOptional(pkgName)
			this.resolved = !this.pkg.isNil
			let errorPkgName = pkgName

			if(this.resolved && !version.isNil) {
				this.resolved = semver.satisfies(
					require(`${pkgName}/package.json`).version,
					version
				)

				if(!this.resolved) {
					errorPkgName += `@${version}`
				}
			}

			if(!this.resolved) {
				const error = new MissingPackageError(errorPkgName, 'dev')

				if(isFatal) {
					throw error
				}

				Log.error(error.message, 'Unable to process.')
			}

			return this.resolved
		}
	}
}
