require './globals'
Grind = require 'express'

module.exports = ->
	grind = Grind()

	grind.env = ->
		return process.env.NODE_ENV or 'local'

	grind.routes = make './router', grind
	grind.config = make './config', grind

	return grind
