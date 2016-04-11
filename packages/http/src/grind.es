require './globals'
Grind = require 'express'

module.exports = ->
	grind = Grind()

	grind.env = ->
		return process.env.NODE_ENV or 'local'

	grind.routes = make './router', grind
	grind.config = make './config', grind
	grind.booted = false
	grind.providers = [ ]

	grind.boot = ->
		return if @booted

		for provider in @providers
			provider this

		@booted = true
		return

	listen = grind.listen

	grind.listen = ->
		@boot()
		return listen.apply grind, arguments

	return grind
