export function cacheBust(url) {
	url = url.replace(/(\?|&)?__ts=\d+/g, '')

	if(url.indexOf('?') >= 0) {
		url += '&'
	} else {
		url += '?'
	}

	return `${url}__ts=${Date.now()}`
}
