import { Controller } from 'grind-http'

export class QueueController extends Controller {

	async status(req, res) {
		const result = await this.app.queue.status(req.params.job)

		if(result.state === 'missing') {
			res.status(404)
		}

		return res.send(result)
	}

}
