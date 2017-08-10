import test from 'ava'
import './makeApp'
import '../helpers/Models/UserModel'
import '../helpers/Models/UserAvatarModel'

test.beforeEach(async t => {
	t.context.app = await makeApp()

	UserModel.app(t.context.app)
	UserModel.knex(t.context.app.db)
	t.context.UserModel = UserModel

	UserAvatarModel.app(t.context.app)
	UserAvatarModel.knex(t.context.app.db)
	t.context.UserAvatarModel = UserAvatarModel
})

test.afterEach.always(t => t.context.app.shutdown())

module.exports = {
	test: test.serial
}
