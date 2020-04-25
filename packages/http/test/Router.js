import test from 'ava'
import './helpers/request'

function get(path) {
	return request(app => {
		app.routes.load('./fixtures/Routes')
	}, path)
}

test('load', t => {
	return get('load').then(response => {
		t.is(response.body, '{"loaded":true}')
	})
})
