import './HttpError'

const clientErrors = require('./HttpClientError.js')
const serverErrors = require('./HttpServerError.js')
const allErrors = { ...clientErrors, ...serverErrors }

Object.assign(global, allErrors)

const codesMapping = { }

for(const name of Object.keys(allErrors)) {
	const error = allErrors[name]
	const code = error.representsCode

	if(code === 0) {
		continue
	}

	codesMapping[code] = error
}

HttpError.make = (code, message) => {
	return new codesMapping[code](message)
}

global.HttpError = HttpError
export const Errors = HttpError
