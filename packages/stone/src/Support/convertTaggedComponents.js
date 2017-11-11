import './nextIndexOf'
import './nextClosingIndexOf'

export function convertTaggedComponents(tags, contents) {
	if(tags.isNil || Object.keys(tags).length === 0) {
		return contents
	}

	for(const [ tag, template ] of Object.entries(tags)) {
		const open = new Set([ `<${tag}>`, `<${tag} `, `<${tag}\t`, `<${tag}\n` ])
		let index = null

		while((index = nextIndexOf(contents, open)) >= 0) {
			const { endIndex, context } = parseAttributes(contents, index + tag.length + 1)
			const directive = contents[endIndex - 2] === '/' ? 'include' : 'component'
			contents = `${contents.substring(0, index)}@${directive}('${template}', ${context})${contents.substring(endIndex)}`

			if(directive === 'include') {
				continue
			}

			contents = contents.replace(new RegExp(`<\\/${tag}\\s*>`, 'm'), '@endcomponent()')
		}
	}

	return contents
}

function parseAttributes(contents, fromIndex) {
	let endIndex = fromIndex
	contents = contents.substring(fromIndex)
	let match = null
	const attributes = [ ]

	while(
		!contents.match(/^\s*(\/)?>/)
		&& (match = contents.match(/(?:\b([a-z0-9_-]+)(?:(\s*=\s*(["'{]))|\b)|\s+(\{\s*\.\.\.))/i))
	) {
		if(!match[4].isNil) {
			const end = nextClosingIndexOf(contents, '{', '}')
			attributes.push([ '$$spread', contents.substring(match[0].length, end - 1) ])
			contents = contents.substring(end)
			endIndex += end
			continue
		}

		contents = contents.substring(match.index + match[1].length)
		endIndex += match.index + match[1].length

		if(match[2].isNil) {
			attributes.push([ match[1], 'true' ])
		} else if(match[3] === '{') {
			const end = nextClosingIndexOf(contents, '{', '}')
			attributes.push([ match[1], contents.substring(match[2].length, end - 1) ])
			contents = contents.substring(end)
			endIndex += end
		} else {
			const end = contents.indexOf(match[3], match[2].length) + 1
			attributes.push([ match[1], contents.substring(match[2].length - 1, end) ])
			contents = contents.substring(end)
			endIndex += end
		}
	}

	let context = '{'
	const objects = [ ]

	for(const [ key, value ] of attributes) {
		if(key === '$$spread') {
			objects.push(`${context}}`)
			objects.push(value)
			context = '{'
			continue
		}

		context += `'${key}':${value},`
	}

	if(context.length > 1) {
		objects.push(`${context}}`)
	}

	endIndex += contents.indexOf('>') + 1

	return {
		endIndex,
		context: objects.length === 0 ? '{ }' : (
			objects.length === 1 ? objects[0] : `Object.assign({ }, ${objects.join(',')})`
		)
	}
}
