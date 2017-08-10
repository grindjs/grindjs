import { Model } from '../../../src'
import './UserModel'

export class UserAvatarModel extends Model {
	static tableName = 'user_avatars'
	static eager = '[user]'

	static buildRelations() {
		return {
			user: this.belongsTo(UserModel)
		}
	}
}
