import { Controller } from '@grindjs/http'

export class HelloController extends Controller {
	show(req, res) {
		return res.render('welcome', {
			name: 'Hello!',
		})
	}
}
