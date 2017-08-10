import './helpers/test'

test('validate missing', async t => {
	try {
		await t.context.UserAvatarModel.query().insert({
			user_id: Date.now(),
			url: 'test'
		})

		t.fail('Error should have been thrown.')
	} catch(err) {
		if(!(err instanceof ValidationError)) {
			throw err
		}

		t.is(typeof err.data.user_id, 'string')
	}
})

test('validate existing', async t => {
	await t.context.UserAvatarModel.query().insert({
		user_id: 1,
		url: 'test'
	})

	t.pass()
})
