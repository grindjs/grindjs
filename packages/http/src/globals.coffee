path = require 'path'

global.resolve = (file, index = 1) ->
	original = Error.prepareStackTrace
	Error.prepareStackTrace = (err, stack) -> return stack
	stack = (new Error()).stack
	Error.prepareStackTrace = original

	dir = path.dirname stack[index].getFileName()

	c = require(path.resolve(dir, file))
	c = c[Object.keys(c)[0]] if typeof c isnt 'function'

	return c

global.make = (file, params...) ->
	c = resolve file, 2
	i = Object.create c.prototype
	c.apply i, params
	return i
