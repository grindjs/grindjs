import { Model } from '../../../src'
import './UserAvatarModel'

export class UserModel extends Model {
	static tableName = 'users'

	static buildRelations() {
		return {
			avatar: this.hasOne(UserAvatarModel)
		}
	}

}
