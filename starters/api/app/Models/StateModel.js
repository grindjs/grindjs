import {Model} from 'grind-orm'

export class StateModel extends Model {
	static tableName = 'states'

	static jsonSchema = {
		type: 'object',
		required: [ 'name', 'abbreviation' ],

		properties: {
			id: { type: 'integer' },
			name: { type: 'string', maxLength: 64 },
			abbreviation: { type: 'string', maxLength: 2 }
		}
	}

	static query() {
		return super.query().orderBy('abbreviation', 'asc')
	}

	static find(term) {
		return this.query().where('name', 'like', `%${term}%`).orWhere('abbreviation', 'like', `%${term}%`)
	}

	static findByAbbreviation(abbreviation) {
		return super.query().where('abbreviation', abbreviation.toUpperCase()).first()
	}

	static findByRouteParameter(value) {
		return this.findByAbbreviation(value)
	}

}
