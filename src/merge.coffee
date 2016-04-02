merge = (a, b) ->
	typeA = if Array.isArray a then 'array' else typeof a
	typeB = if Array.isArray b then 'array' else typeof b

	return b if typeA isnt typeB or typeA is 'undefined'
	return a if typeB is 'undefined'

	if typeA is 'object'
		merged = Object.assign { }, a

		for k of b
			merged[k] = merge a[k], b[k]

		return merged
	else if typeA is 'array'
		return a.concat b
	else
		return b

module.exports = merge
