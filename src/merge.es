export function merge(a, b) {
	var typeA = Array.isArray(a) ? 'array' : typeof a
	var typeB = Array.isArray(b) ? 'array' : typeof b

	if(typeA !== typeB || typeA === 'undefined') {
		return b
	}

	if(typeB === 'undefined') {
		return a
	}

	if(typeA === 'object') {
		var merged = Object.assign({ }, a)

		for(var k in b) {
			merged[k] = merge(a[k], b[k])
		}

		return merged
	} else if(typeA === 'array') {
		return a.concat(b)
	} else {
		return b
	}
}
