export * from './HttpError/index'

import * as errors from './HttpError/index'

Object.assign(global, errors)

const codesMapping: Record<number, typeof errors.HttpError> = {}

for (const name of Object.keys(errors)) {
	const error = (errors as any)[name] as typeof errors.HttpError
	const code = error.representsCode

	if (code === 0) {
		continue
	}

	codesMapping[code] = error
}

errors.HttpError.make = (code, message) => {
	return new codesMapping[code](message)
}
