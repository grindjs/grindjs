import { Controller } from 'grind-http'

export class HelloController extends Controller {
	show(req, res) {
		return res.render('welcome', {
			name: 'Hello!',
		})
	}
}
