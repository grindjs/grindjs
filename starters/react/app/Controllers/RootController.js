import { Controller } from 'grind-http'

export class RootController extends Controller {

	versions

	constructor(app) {
		super(app)

		this.versions = {
			react: require('react/package.json').version,
			dom: require('react-dom/package.json').version,
			conductor: require('@khrrsn/react-conductor/package.json').version
		}
	}

	index(req, res) {
		return res.render('root', {
			debug: this.app.debug,
			versions: this.versions
		})
	}

}
