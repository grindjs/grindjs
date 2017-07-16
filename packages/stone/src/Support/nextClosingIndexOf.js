import './nextIndexOf'

/**
 * Finds the closing index of an open/close sequence
 *
 * @param  {string} string        String to search in
 * @param  {string} openSequence  Characters indicating the opening of a sequence
 * @param  {string} closeSequence Characters indicating the closing of a sequence
 * @param  {number} fromIndex     Index to search from
 * @return {number}               Index of the close sequence or -1
 */
export function nextClosingIndexOf(string, openSequence, closeSequence, fromIndex) {
	if(openSequence.length !== closeSequence.length) {
		throw new TypeError('The opening and closing sequences must be the same length.')
	}

	const sequences = [ openSequence, closeSequence ]
	const sequenceLength = openSequence.length
	let openCount = -1

	while(openCount !== 0 && (fromIndex = nextIndexOf(string, sequences, fromIndex)) >= 0) {
		const sequence = string.substring(fromIndex, fromIndex + sequenceLength)

		if(sequence === closeSequence) {
			openCount--
		} else if(openCount === -1) {
			openCount = 1
		} else {
			openCount++
		}

		fromIndex += sequenceLength
	}

	return fromIndex
}
