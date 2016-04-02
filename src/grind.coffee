require './globals'
Grind = require 'express'

module.exports = ->
	express = Grind()
	express.routes = make './router', express
	return express
