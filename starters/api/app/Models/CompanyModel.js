import {Model} from 'grind-orm'

import 'App/Models/StateModel'

export class CompanyModel extends Model {
	static tableName = 'companies'
	static eager = 'locations'

	static jsonSchema = {
		type: 'object',
		required: [ 'name' ],

		properties: {
			id: { type: 'integer' },
			name: { type: 'string', maxLength: 255 },
			created_at: { type: 'datetime', format: 'date-time' },
			updated_at: { type: 'datetime', format: 'date-time' }
		}
	}

	static buildRelations() {
		return {
			locations: this.belongsToMany(StateModel)
		}
	}

}
