fs = require 'fs'
path = require 'path'
merge = require './merge'

class exports.Config
	_repository: null

	constructor: (app = nil) ->
		@_repository = { }
		@populate(app) if app

	get: (keyPath, fallback = null) ->
		keys = keyPath.split '.'

		value = @_repository[keys.shift()]
		return fallback if not value

		for key in keys
			value = value?[key]

		return value or fallback

	has: (keyPath) ->
		return @get keyPath isnt null

	set: (keyPath, value) ->
		object = @_repository
		keys = keyPath.split '.'
		last = keys.pop()

		if keys.length > 0
			for key in keys
				object = object?[keys.shift()]

		object[last] = value if object
		return

	populate: (app) ->
		dir = path.join process.cwd(), 'config'

		exists = (path) ->
			try
				fs.accessSync path, fs.F_OK
				return true
			catch e
				return false


		if not exists(dir)
			console.error 'Unable to populate config, path does not exist', dir
			return

		files = { }

		@_populateConfigFiles files, dir

		for env in app.env().split '.'
			dir = path.join dir, env

			if exists dir
				@_populateConfigFiles files, dir
			else
				break

		for group of files
			continue if group is '.env'

			@_repository[group] = { } if not @_repository[group]

			for file in files[group]
				@_repository[group] = merge @_repository[group], require(file)

		if files['.env']
			for file in files['.env']
				config = require file

				for group of config
					@_repository[group] = merge (@_repository[group] or { }), config[group]


		return

	_populateConfigFiles: (files, dir) ->
		for file in fs.readdirSync dir
			continue if path.extname(file) isnt '.json'

			name = path.basename file, '.json'
			files[name] = [ ] if not files[name]
			files[name].push path.join(dir, path.basename(file))

		return
