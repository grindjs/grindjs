class exports.Router
	_scopedAction: null
	_scopedPrefix: ''

	constructor: (@app) ->

	group: (action, callback) ->
		@_scopedAction = Object.assign { }, action

		if @_scopedAction.prefix
			@_scopedPrefix = @_scopedAction.prefix
			delete @_scopedAction.prefix
		else
			@_scopedPrefix = ''

		callback()

		@_scopedAction = null
		@_scopedPrefix = ''

	all: (path, action) ->
		return @app.all @_scopedPrefix + path, @_makeAction(action)

	get: (path, action) ->
		return @app.get @_scopedPrefix + path, @_makeAction(action)

	post: (path, action) ->
		return @app.post @_scopedPrefix + path, @_makeAction(action)

	put: (path, action) ->
		return @app.put @_scopedPrefix + path, @_makeAction(action)

	delete: (path, action) ->
		return @app.delete @_scopedPrefix + path, @_makeAction(action)

	_makeAction: (action) ->
		if typeof action is 'function'
			return action
		else
			if typeof action is 'string'
				action =
					method: action

			action = Object.assign { }, @_scopedAction, action
			method = action.controller[action.method]
			controller = action.controller
			return ->
				method.apply controller, arguments
