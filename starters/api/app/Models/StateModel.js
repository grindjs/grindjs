import {Model} from 'grind-orm'

import 'App/Models/CountryModel'
import 'App/Models/CompanyModel'

export class StateModel extends Model {
	static tableName = 'states'

	static jsonSchema = {
		type: 'object',
		required: [ 'name', 'abbreviation', 'country_id' ],

		properties: {
			id: { type: 'integer' },
			name: { type: 'string', maxLength: 64 },
			abbreviation: { type: 'string', maxLength: 2 },
			country_id: { type: 'integer', relation: 'country' }
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

	static buildRelations() {
		return {
			country: this.belongsTo(CountryModel),
			companies: this.belongsToMany(CompanyModel)
		}
	}

}
