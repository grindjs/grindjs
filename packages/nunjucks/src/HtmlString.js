import { runtime as NunjucksRuntime } from 'nunjucks'

export class HtmlString extends NunjucksRuntime.SafeString {

	constructor(html) {
		super(html)

		Log.error('WARNING: HtmlString is deprecated and will be removed in 0.6, use Nunjuck’s SafeString instead.')
	}

}
