const errors = require('./HttpError/index.js')
Object.assign(global, errors)
Object.assign(module.exports, errors)

const codesMapping = { }

for(const name of Object.keys(errors)) {
	const error = errors[name]
	const code = error.representsCode

	if(code === 0) {
		continue
	}

	codesMapping[code] = error
}

HttpError.make = (code, message) => {
	return new codesMapping[code](message)
}
