import { MissingPackageError } from '@grindjs/framework'

const loadOptional = require('optional')
const semver = require('semver')
const { readFileSync } = require('fs')
const { sync: pkgUp } = require('pkg-up')

export function optional(pkgName, version = null) {
	return {
		pkg: null,
		name: pkgName,
		resolved: null,

		assert() {
			return this.resolve(true)
		},

		resolve(isFatal = false) {
			if (typeof this.resolved === 'boolean') {
				return this.resolved
			}

			this.pkg = loadOptional(pkgName)

			if (this.pkg && this.pkg.default) {
				this.pkg = this.pkg.default
			}

			this.resolved = !this.pkg.isNil
			let errorPkgName = pkgName

			if (this.resolved && !version.isNil) {
				this.resolved = semver.satisfies(
					JSON.parse(readFileSync(pkgUp({ cwd: require.resolve(pkgName) }))).version,
					version,
				)

				if (!this.resolved) {
					errorPkgName += `@${version}`
				}
			}

			if (!this.resolved) {
				const error = new MissingPackageError(errorPkgName, 'dev')

				if (isFatal) {
					throw error
				}

				Log.error(error.message, 'Unable to process.')
			}

			return this.resolved
		},
	}
}
