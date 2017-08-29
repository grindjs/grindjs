import './EventCollectorBuilder'

const path = require('path')

export function ViewCollector(app, devbar) {
	if(app.view.isNil) {
		return
	}

	const events = EventCollectorBuilder(app, devbar, app.view)
	const views = app.paths.base('resources/views')
	const cleanTemplate = template => path.relative(views, template).replace(/\//g, '.').replace(/^\.+|\.stone$/g, '')

	events.on('compile:start', (devbar, template) => {
		devbar.time(`compile-${template}`, `Compile ${cleanTemplate(template)}`)
	})

	events.on('compile:end', (devbar, template) => {
		devbar.timeEnd(`compile-${template}`)
	})

	events.on('render:start', (devbar, template) => {
		devbar.time(`render-${template}`, `Render ${cleanTemplate(template)}`)
	})

	events.on('render:end', (devbar, template) => {
		devbar.timeEnd(`render-${template}`)
	})
}
