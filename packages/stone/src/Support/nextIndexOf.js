/**
 * Finds the next index of a set of characters
 *
 * @param  {string}    string    String to search in
 * @param  {array|set} set       Array or set of characters to search for
 * @param  {number}    fromIndex Index to search from
 * @return {number}              Index of the parenthesis or -1
 */
export function nextIndexOf(string, set, fromIndex) {
	let index = null

	for(const character of set) {
		const characterIndex = string.indexOf(character, fromIndex)

		if(characterIndex === -1) {
			continue
		}

		if(index === null) {
			index = characterIndex
		}

		index = Math.min(index, characterIndex)
	}

	if(index === null) {
		return -1
	}

	return index
}
