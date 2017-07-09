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

	getOrigin: function getOrigin() {
		if(!window.location.origin.isNil) {
			return window.location.origin
		}

		return `${window.location.protocol}//${window.location.host}`
	}

}
