export function Group(knex, callback, parent) {
	var count = 0
	var total = 0
	var after = null

	var next = function() {
		if(--count === 0) {
			after()

			if(parent != null){
				parent()
			}
		}
	}

	return callback({
		_inject(obj) {
			count++
			total++

			var t = obj.then
			obj.then = function(callback) {
				if(callback) {
					var wrapped = function() {
						callback.apply(null, arguments)
						next()
					}

					return t.apply(this, [ wrapped ])
				} else {
					return t.apply(this, arguments)
				}
			}


			var a = obj.asCallback
			obj.asCallback = function(callback) {
				var wrapped = function() {
					callback.apply(null, arguments)
					next()
				}

				return a.apply(this, [ wrapped ])
			}
			return obj.after = obj.asCallback
		},

		raw(query) {
			var raw = knex.raw(query)
			this._inject(raw)
			return raw
		},

		query(tableName) {
			var builder = knex(tableName)
			this._inject(builder)
			return builder
		},

		builder() {
			var builder = knex.queryBuilder()
			this._inject(builder)
			return builder
		},

		group(callback) {
			count++
			total++
			return group(knex, callback, next)
		},

		// Called after all queries have executed
		after(callback) {
			after = callback

			// Protect against queries having already all executed
			if(total > 0 && count === 0) {
				count++
				next()
			}
		}
	})
}
