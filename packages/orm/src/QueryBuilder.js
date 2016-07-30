import { QueryBuilder as ObjectionQueryBuilder } from 'objection'

export class QueryBuilder extends ObjectionQueryBuilder {
	static registeredFilters = { }

	_cyclicalEagerProtection = [ ]
	_allowEager = true

	static registerFilter(name, filter) {
		this.registeredFilters[name] = filter
	}

	subset(limit, offset = 0) {
		if(typeof limit === 'object') {
			offset = limit.offset || 0
			limit = limit.limit
		}

		return this.limit(limit).offset(offset)
	}

	withoutEager() {
		this._allowEager = false
		this._eagerExpression = null
		this._eagerFilterExpressions = [ ]
		return this
	}

	eager(exp, filters) {
		if(!this._allowEager) {
			return this
		}

		if(!exp.isNil) {
			filters = Object.assign({ }, this.constructor.registeredFilters, filters || { })
		}

		return super.eager(exp, filters)
	}

	clone() {
		const builder = super.clone()
		builder._cyclicalEagerProtection = [ ].concat(this._cyclicalEagerProtection)
		builder._allowEager = this._allowEager
		return builder
	}

	childQueryOf(query) {
		super.childQueryOf(query)

		if(!query.isNil && !query._cyclicalEagerProtection.isNil) {
			this._cyclicalEagerProtection = [ ].concat(query._cyclicalEagerProtection)
		}

		return this
	}

	// Objection 0.5.x
	execute() {
		return this.__execute('execute')
	}

	// Objection 0.4.x
	_execute() {
		return this.__execute('_execute')
	}

	__execute(name) {
		if(this._allowEager && this.isFindQuery()) {
			if(this._cyclicalEagerProtection.indexOf(this._modelClass) >= 0) {
				return Promise.resolve([ ])
			}

			if(this._eagerExpression === null) {
				const filters = this._modelClass.eager.isNil ? null : this._modelClass.eagerFilters
				this.eager(this._modelClass.eager, filters)
			}
		}

		this._cyclicalEagerProtection.push(this._modelClass)

		return super[name]().then(result => {
			this._cyclicalEagerProtection.pop()
			return result
		})
	}

}
