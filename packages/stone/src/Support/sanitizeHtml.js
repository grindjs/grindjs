/**
 * Sanitizes a block of HTML by replacing white space
 * and converting output tags to placeholders for
 * use within template literals
 *
 * @param  {string} html Raw HTML
 * @return {string}      Sanitized HTML
 */
export function sanitizeHtml(html) {
	const placeholders = { }
	let placeholderOrdinal = 0

	// Store regular output blocks
	html = html.replace(/(^|[^@])\{\{\s*(.+?)\s*\}\}/g, ($0, $1, $2) => {
		const placeholder = `@@__stone_placeholder_${++placeholderOrdinal}__@@`
		placeholders[placeholder] = `\${escape(${$2})}`
		return `${$1}${placeholder}`
	})

	// Strip escaped braces
	html = html.replace(/@\{\{(.+?)\}\}/g, '{{$1}}')

	// Store raw output blocks
	html = html.replace(/\{!!\s*(.+?)\s*!!\}/g, ($0, $1) => {
		const placeholder = `@@__stone_placeholder_${++placeholderOrdinal}__@@`
		placeholders[placeholder] = `\${${$1}}`
		return placeholder
	})

	// Escape escape characters
	html = html.replace(/\\/g, '\\\\')

	// Escape backticks
	html = html.replace(/`/g, '\\`')

	// Escape whitespace characters
	html = html.replace(/[\n]/g, '\\n')
	html = html.replace(/[\r]/g, '\\r')
	html = html.replace(/[\t]/g, '\\t')

	// Restore placeholders
	for(const [ placeholder, content ] of Object.entries(placeholders)) {
		html = html.replace(placeholder, content)
	}

	return html
}
