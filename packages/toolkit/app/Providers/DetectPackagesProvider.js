import { FS } from 'grind-support'

const path = require('path')

export async function DetectPackagesProvider(app) {
	app.packages = [ ]

	if(!await FS.exists(app.paths.bootstrap)) {
		return
	}

	const bootstrap = (await FS.readFile(app.paths.bootstrap)).toString()
	const info = require(app.paths.packageInfo)
	const packages = new Set([
		'grind-cli',
		'grind-http',
		...Object.keys(info.dependencies || { }),
		...Object.keys(info.devDependencies || { }),
		...((info.grind || { }).packages || [ ]),
	])

	bootstrap.replace(/require\s*\(\s*["'`](.+?)["'`]\s*\)/g, (_, pkg) => packages.add(pkg))
	bootstrap.replace(/from\s+["'`](.+?)["'`]/g, (_, pkg) => packages.add(pkg))

	return Promise.all(Array.from(packages).filter(pkg => !/^[./]/.test(pkg)).map(async pkg => {
		const packagePath = app.paths.packages(pkg.includes('/') ? path.dirname(pkg) : pkg)
		const packageInfoPath = path.join(packagePath, 'package.json')

		if(!await FS.exists(packageInfoPath)) {
			return
		}

		const { grind } = require(packageInfoPath)

		if(grind === null || typeof grind !== 'object') {
			return
		}

		app.packages.push({
			name: pkg,
			path: packagePath,
			config: grind
		})
	}))
}

DetectPackagesProvider.priority = -100
