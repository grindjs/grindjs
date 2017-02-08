import './Errors/HttpError'

const clientErrors = require('./Errors/HttpClientError.js')
const serverErrors = require('./Errors/HttpServerError.js')

Object.assign(global, clientErrors, serverErrors)

const codesMapping = { }

for(const errors of [ clientErrors, serverErrors ]) {
	for(const name of Object.keys(errors)) {
		const error = errors[name]
		const code = error.representsCode

		if(code === 0) {
			continue
		}

		codesMapping[code] = error
	}
}

HttpError.make = (code, message) => {
	return new codesMapping[code](message)
}

global.HttpError = HttpError
export const Errors = HttpError
