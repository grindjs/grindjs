import test from 'ava'
import './helpers/request'

const payload = { }

for(let i = 0; i < 10000; i++) {
	payload[`test${i}`] = 'test'
}

function get(path, options) {
	const boot = app => {
		app.routes.get('/test', (req, res) => {
			res.send({ ...payload })
		})
	}

	boot.before = app => {
		app.config.set('routing.middleware', [ 'compression', ...app.config.get('routing.middleware', [ ]) ])
	}

	return request(100, boot, path, options)
}

test('compressed', t => {
	return get('test', {
		gzip: true,
		json: true
	}).then(response => {
		t.deepEqual(response.headers['content-encoding'], 'gzip')
		t.deepEqual(response.headers['transfer-encoding'], 'chunked')
		t.deepEqual(response.body, { ...payload })
	})
})

test('uncompressed', t => {
	return get('test', {
		gzip: false,
		json: true
	}).then(response => {
		t.deepEqual(response.headers['content-encoding'], void 0)
		t.deepEqual(response.headers['transfer-encoding'], void 0)
		t.deepEqual(response.body, { ...payload })
	})
})
