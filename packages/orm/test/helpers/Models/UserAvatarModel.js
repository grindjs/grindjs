import { Model } from '../../../src'
import './UserModel'

export class UserAvatarModel extends Model {

	static tableName = 'user_avatars'
	static eager = '[user]'

	static jsonSchema = {
		type: 'object',

		properties: {
			id: { type: 'number' },
			user_id: { type: 'integer', relation: 'user' },
			url: { type: 'string', maxLength: 128 },
			created_at: { type: 'string', format: 'date-time' },
			updated_at: { type: 'string', format: 'date-time' }
		}
	}

	static buildRelations() {
		return {
			user: this.belongsTo(UserModel)
		}
	}

}
