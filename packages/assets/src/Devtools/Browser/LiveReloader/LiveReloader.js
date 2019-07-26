import { CssReloader } from './CssReloader'
import { JsReloader } from './JsReloader'

export function LiveReloader(context) {
	context.socket.on('change', pathname => {
		if(/(css|sass|less|stylus|styl)$/i.test(pathname)) {
			CssReloader(pathname)
		} else if(/(js|jsx)$/i.test(pathname)) {
			JsReloader(pathname)
		}
	})
}
