function getOrigin() {
	if(!window.location.origin.isNil) {
		return window.location.origin
	}

	// Polyfill for IE
	const origin = `${window.location.protocol}//${window.location.host}`
	window.location.origin = origin
	return origin
}

module.exports = {

	cacheBust: function cacheBust(url) {
		url = url.replace(/(\?|&)?__ts=\d+/g, '')

		if(url.indexOf('?') >= 0) {
			url += '&'
		} else {
			url += '?'
		}

		return `${url}__ts=${Date.now()}`
	},

	origininize: function origininize(pathname) {
		pathname = pathname.split(/\?/)[0]
		const origin = getOrigin()

		if(pathname.substring(0, origin.length) === origin) {
			pathname = pathname.substring(origin.length)
		}

		return pathname
	}

}
