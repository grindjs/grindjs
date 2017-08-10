import './helpers/test'
import '../src/ModelNotFoundError'

test('execute', async t => {
	const avatar = await t.context.UserAvatarModel.findByIdOrFail(1)
	t.is(avatar.user.id, 1)
})

test('withoutEager', async t => {
	const avatar = await t.context.UserAvatarModel.findByIdOrFail(1).withoutEager()
	t.is(avatar.user, void 0)
})

test('orFail', async t => {
	try {
		await t.context.UserModel.query().where('id', 1).orFail()
	} catch(err) {
		t.fail(`Should not have thrown an error: ${err}`)
	}

	try {
		await t.context.UserModel.query().where('id', Date.now()).orFail()
		t.fail('Should have thrown an error')
	} catch(err) {
		if(err instanceof ModelNotFoundError) {
			return t.pass()
		}

		throw err
	}
})

test('paginate', async t => {
	const users = await t.context.UserModel.query().paginate({ query: { page: 2 } }, 1)
	t.is(Array.isArray(users.results), true)
	t.is(users.results.length, 1)
	t.is(users.results[0].id, 2)
	t.is(users.total, 2)
	t.is(users.totalPages, 2)
	t.is(users.perPage, 1)
	t.is(users.page, 2)
	t.is(users.start, 1)
	t.is(users.end, 2)
})

test('paginate - param', async t => {
	const users = await t.context.UserModel.query().paginate({ params: { p: 10 } }, 1, { param: 'p' })
	t.is(users.page, 10)
})

test('paginate - query', async t => {
	const users = await t.context.UserModel.query().paginate({ query: { p: 10 } }, 1, { query: 'p' })
	t.is(users.page, 10)
})
