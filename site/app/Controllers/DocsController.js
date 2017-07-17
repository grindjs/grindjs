import { Controller } from 'grind-framework'

import 'App/Support/Documentation'
import 'App/Support/Markdown'

const fs = require('fs')
const semver = require('semver')

export class DocsController extends Controller {
	docs = null
	versions = null
	currentVersion = null

	constructor(app) {
		super(app)

		this.docs = new Documentation(app)

		// eslint-disable-next-line no-sync
		this.versions = fs.readdirSync(this.docs.basePath).sort().reverse()
		this.currentVersion = this.versions.find(version => version !== 'master')
	}

	async show(req, res) {
		const path = req.originalUrl.replace(/^\/docs/, '').replace(/\/$/g, '')

		if(path.length === 0 || req.params.group.isNil) {
			return res.route('docs.show', [ this.currentVersion, 'guides', 'installation' ])
		} else if(req.params.version.isNil) {
			const params = Object.values(req.params).filter(param => !param.isNil)
			params.unshift(this.currentVersion)

			return res.route('docs.show', params)
		} else if(req.params.a.isNil) {
			switch(req.params.group) {
				case 'guides':
					return res.route('docs.show', [ req.params.version, 'guides', 'installation' ])
				case 'structure':
					return res.route('docs.show', [ req.params.version, 'structure', 'index' ])
				default:
					throw new NotFoundError
			}
		}

		const [ documentation, { content, title } ] = await Promise.all([
			this.docs.contents(req, req.params.version, req.params.group, path),
			this.docs.get(path)
		])

		return res.render('docs.show', {
			documentation: documentation,
			content: content,
			title: title,
			path: path,
			activeVersion: req.params.version,
			versions: this.versions,
			routeParams: req.params
		})
	}

	async releaseNotes(req, res) {
		const path = req.originalUrl.replace(/^\/docs/, '').replace(/\/$/g, '')
		const currentVersion = semver.parse(
			`${req.params.version === 'master' ? this.currentVersion : req.params.version}.0`
		)
		const nextVersion = semver.parse(currentVersion.toString()).inc('minor')

		let releases = { }
		for(const release of await this._fetchReleases(req, currentVersion, nextVersion)) {
			for(const version of release.versions) {
				version.body = version.body.trim()
				version.body = version.body.replace(
					/\(http(s)?:\/\/grind.rocks\/docs\/.+?\/guides\/(.+?)\)/ig,
					'($2)'
				)

				releases[version.tag_name] = releases[version.tag_name] || [ ]
				releases[version.tag_name].push({
					name: release.name,
					body: Markdown.render(version.body)
				})
			}
		}

		releases = Object.entries(releases).map(([ version, notes ]) => ({ version, notes }))
		releases.sort(({ version: a }, { version: b }) => semver.gte(b, a))

		for(const release of releases) {
			release.notes.sort(({ name: a }, { name: b }) => {
				// Ensure framework is alway first
				if(a === 'framework') {
					return -1
				} else if(b === 'framework') {
					return 1
				}

				// Then sort alphabetically
				return a.localeCompare(b)
			})
		}

		const documentation = await this.docs.contents(req, req.params.version, req.params.group, path)

		return res.render('docs.release-notes', {
			documentation: documentation,
			activeVersion: req.params.version,
			versions: this.versions,
			routeParams: {
				...req.params,
				a: 'release-notes'
			},
			releases: releases
		})
	}

	_fetchReleases(req, currentVersion, nextVersion) {
		const master = req.params.version === 'master'

		return this.app.cache.wrap(`release-notes-${req.params.version}`, async () => {
			const matches = (await this.app.github.search.repos({
				q: 'user:grindjs',
				page: 1,
				per_page: 100
			})).data.items.filter(match => !match.name.includes('editor') && !match.name.includes('core'))

			return Promise.all(matches.map(async match => ({
				name: match.name,
				versions: (await this.app.github.repos.getReleases({
					owner: match.owner.login,
					repo: match.name,
					page: 1,
					per_page: 100
				})).data.filter(release => {
					if(release.draft) {
						return false
					}

					if(release.prerelease && !master) {
						return false
					}

					const version = semver.parse(release.tag_name)

					if(version.isNil) {
						return false
					}

					if(!semver.gte(version, currentVersion)) {
						return false
					}

					if(master) {
						return true
					}

					return semver.lt(version, nextVersion)
				})
			})))
		}, { ttl: 300 })
	}

}
