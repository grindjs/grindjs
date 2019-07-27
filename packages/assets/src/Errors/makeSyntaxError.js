import { FS } from 'grind-support'
import { codeFrameColumns } from '@babel/code-frame'

const path = require('path')

export async function makeSyntaxError(app, { message, fileName, lineNumber, columnNumber, causedBy } = { }) {
	if(!causedBy.isNil) {
		if(typeof message !== 'string') {
			message = causedBy.message
		}

		if(typeof fileName !== 'string') {
			fileName = causedBy.fileName || causedBy.filename || causedBy.file
		}

		if(typeof lineNumber !== 'number') {
			lineNumber = causedBy.lineNumber || causedBy.line
		}

		if(typeof columnNumber !== 'number') {
			columnNumber = causedBy.columnNumber || causedBy.column
		}
	}

	if(
		typeof fileName !== 'string'
		|| typeof lineNumber !== 'number'
		|| lineNumber <= 0
		|| !(await FS.exists(fileName))
	) {
		return causedBy || new SyntaxError(message)
	}

	const lines = (await FS.readFile(fileName)).toString()
	const codeFrame = codeFrameColumns(lines, {
		start: {
			line: lineNumber || 1,
			column: columnNumber || 1
		}
	}, {
		highlightCode: true,
		forceColor: true
	})

	const relativeFileName = `./${path.relative(app.paths.base(), fileName)}`
	const error = new SyntaxError(`${relativeFileName}\nLine ${lineNumber}: ${message}\n\n${codeFrame}`, fileName, lineNumber)

	error.cause = causedBy

	return error
}
