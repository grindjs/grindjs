import { QueryBuilder as ObjectionQueryBuilder } from 'objection'

export class QueryBuilder extends ObjectionQueryBuilder {

	subset(limit, offset = 0) {
		if(typeof limit === 'object') {
			offset = limit.offset || 0
			limit = limit.limit
		}

		return this.limit(limit).offset(offset)
	}

	execute() {
		if(this.isFindQuery() && this._eagerExpression === null) {
			this.eager(this._modelClass.eager, this._modelClass.eagerFilters)
		}

		return super.execute()
	}

}
