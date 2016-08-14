import {Controller} from 'grind-framework'

export class HelloController extends Controller {

	show(req, res) {
		res.render('welcome.njk', {
			name: 'Hello!'
		})
	}

}
