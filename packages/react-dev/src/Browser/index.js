import ErrorOverlay from 'react-error-overlay'
import launchEditorEndpoint from 'react-dev-utils/launchEditorEndpoint'

ErrorOverlay.setEditorHandler(errorLocation => {
	window.fetch(
		[
			launchEditorEndpoint,
			`?fileName=${window.encodeURIComponent(errorLocation.fileName)}`,
			`&lineNumber=${window.encodeURIComponent(errorLocation.lineNumber || 1)}`,
			`&colNumber=${window.encodeURIComponent(errorLocation.colNumber || 1)}`,
		].join(''),
	)
})

ErrorOverlay.startReportingRuntimeErrors({
	onError: () => {},
})

function reportError({ error }) {
	ErrorOverlay.reportBuildError(error)
}

window.$grindAssets.socket.on('error', (_, error) => {
	reportError(error)
})

for (const error of Object.values(window.$grindAssets.errors)) {
	reportError(error)
}
