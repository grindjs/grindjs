/* global document */

(function() {
	function findTheTestElement() {
		return document.body.getElementById('test')
	}

	findTheTestElement().style.border = 'none'
	console.log('done')
})()
