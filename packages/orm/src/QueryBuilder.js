import { QueryBuilder as BaseQueryBuilder } from 'objection'

import './ModelNotFoundError'

export class QueryBuilder extends BaseQueryBuilder {

	static registeredFilters = { }

	_allowEager = true

	static registerFilter(name, filter) {
		this.registeredFilters[name] = filter
	}

	paginate(req, perPage = 25, { query, param } = { }) {
		let page = 1

		if(!param.isNil) {
			page = Number.parseInt(req.params[param]) || 1
		} else {
			page = Number.parseInt(req.query[query || 'page']) || 1
		}

		page = Math.max(1, page)

		const start = (page - 1) * perPage
		const end = start + perPage

		return this.range(start, end).runAfter(result => {
			result.totalPages = Math.ceil(result.total / perPage)
			result.perPage = perPage
			result.page = page
			result.start = start
			result.end = Math.min(end, result.total)

			return result
		})
	}

	orFail() {
		return this.runAfter(result => {
			if(
				result.isNil ||
				(Array.isArray(result) && result.length === 0) ||
				(Array.isArray(result.results) && result.results.length === 0)
			) {
				throw new ModelNotFoundError(this._modelClass)
			}

			return result
		})
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

		if(typeof exp === 'string') {
			filters = Object.assign({ }, this.constructor.registeredFilters, filters || { })
		}

		return super.eager(exp, filters)
	}

	clone() {
		const builder = super.clone()
		builder._allowEager = this._allowEager
		return builder
	}

	execute() {
		if(this._allowEager && this.isFind()) {
			if(this._eagerExpression === null) {
				const filters = this._modelClass.eager.isNil ? null : this._modelClass.eagerFilters
				this.eager(this._modelClass.eager, filters)
			}
		}

		return super.execute()
	}

}
