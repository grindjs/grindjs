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

	all: (all, action) ->
		console.log 'Don’t use `all` routes. Offender: %s', path
		return @app.all @_scopedPrefix + path, @_makeAction(action)

	get: (path, action, extra) ->
		return @_add 'get', path, action, extra

	post: (path, action, extra) ->
		return @_add 'post', path, action, extra

	put: (path, action, extra) ->
		return @_add 'put', path, action, extra

	delete: (path, action, extra) ->
		return @_add 'delete', path, action, extra

	_add: (method, path, action, extra) ->
		action = @_makeAction action

		# WARNING: Prone to failure if ExpressJS changes this logic

		@app.lazyrouter()
		route = @app._router.route @_scopedPrefix + path
		route = route[method].apply route, [ action ]
		route.extra = extra or {}

		return route

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
