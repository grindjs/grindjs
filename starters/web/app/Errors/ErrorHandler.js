import {ErrorHandler as BaseErrorHandler} from 'grind-framework'
import Ouch from 'ouch'

export class ErrorHandler extends BaseErrorHandler {

	render(req, res, err, info) {
		if(this.app.debug) {
			((new Ouch).pushHandler(
				new Ouch.handlers.PrettyPageHandler('blue', null, 'sublime')
			)).handleException(err, req, res)
		} else {
			try {
				this.renderView(req, res, err, info, info.code.toString())
			} catch(err) {
				this.renderJson(req, res, err, info)
			}
		}
	}

	renderView(req, res, err, info, code) {
		const view = `errors/${code}.njk`

		return this.app.view.exists(view).then(exists => {
			if(!exists) {
				if(code !== '500') {
					return this.renderView(req, res, err, info, 500)
				} else {
					return this.renderJson(req, res, err, info)
				}
			}

			return super.renderView(req, res, err, info, view)
		}).catch(err => {
			return this.renderJson(req, res, err, info)
		})
	}

}
