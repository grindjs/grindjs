class exports.Router
	_scopedAction: null
	_scopedPrefix: ''

	constructor: (@express) ->

	group: (action, callback) ->
		@_scopedAction = Object.assign {}, action

		if @_scopedAction.prefix
			@_scopedPrefix = @_scopedAction.prefix
			delete @_scopedAction.prefix
		else
			@_scopedPrefix = ''

		callback()

		@_scopedAction = null
		@_scopedPrefix = ''

	get: (path, action) ->
		action = @_makeAction action
		return @express.get @_scopedPrefix + path, action

	_makeAction: (action) ->
		if typeof action is 'function'
			return action
		else
			if typeof action is 'string'
				action =
					method: action

			action = Object.assign {}, @_scopedAction, action
			method = action.controller[action.method]
			controller = action.controller
			return ->
				method.apply controller, arguments
