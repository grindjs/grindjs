import path from 'path'

import { Application } from '@grindjs/framework'

import { IDevbar } from '../IDevbar'
import { EventCollectorBuilder } from './EventCollectorBuilder'

export function ViewCollector(app: Application, devbar: IDevbar) {
	if (!app.view) {
		return
	}

	const events = EventCollectorBuilder(app, devbar, app.view)
	const views = app.paths.base('resources/views')
	const cleanTemplate = (template: string) =>
		path
			.relative(views, template)
			.replace(/\//g, '.')
			.replace(/^\.+|\.stone$/g, '')

	events.on('compile:start', (devbar: IDevbar, template: string) => {
		devbar.time(`compile-${template}`, `Compile ${cleanTemplate(template)}`)
	})

	events.on('compile:end', (devbar: IDevbar, template: string) => {
		devbar.timeEnd(`compile-${template}`)
	})

	events.on('render:start', (devbar: IDevbar, template: string) => {
		devbar.time(`render-${template}`, `Render ${cleanTemplate(template)}`)
	})

	events.on('render:end', (devbar: IDevbar, template: string) => {
		devbar.timeEnd(`render-${template}`)
	})
}
