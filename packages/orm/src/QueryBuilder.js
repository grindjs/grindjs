import { QueryBuilder as ObjectionQueryBuilder } from 'objection'

export class QueryBuilder extends ObjectionQueryBuilder {

	subset(limit, offset = 0) {
		return this.limit(limit).offset(offset)
	}

}
