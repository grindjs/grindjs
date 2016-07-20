import { QueryBuilder as ObjectionQueryBuilder } from 'objection'

export class QueryBuilder extends ObjectionQueryBuilder {

	subset(limit, offset = 0) {
		if(typeof limit === 'object') {
			offset = limit.offset || 0
			limit = limit.limit
		}

		return this.limit(limit).offset(offset)
	}

	// Objection 0.5.x
	execute() {
		this._addEager()
		return super.execute()
	}

	// Objection 0.4.x
	_execute() {
		this._addEager()
		return super._execute()
	}

	_addEager() {
		if(!this.isFindQuery() || this._eagerExpression !== null) {
			return
		}

		this.eager(this._modelClass.eager, this._modelClass.eagerFilters)
	}

}
