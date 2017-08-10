import test from 'ava'
import './makeApp'
import '../helpers/Models/UserModel'
import '../helpers/Models/UserAvatarModel'

test.beforeEach(async t => {
	t.context.app = await makeApp()

	UserModel.app(t.context.app)
	t.context.UserModel = UserModel

	UserAvatarModel.app(t.context.app)
	t.context.UserAvatarModel = UserAvatarModel
})

test.afterEach.always(t => t.context.app.shutdown())

export { test }
