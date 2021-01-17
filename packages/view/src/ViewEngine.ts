import { Application } from '@grindjs/framework'

import { ViewFactory } from './ViewFactory'

export class ViewEngine {
	constructor(public app: Application, public view: ViewFactory) {}

	bootstrap(): Promise<void> {
		return Promise.resolve()
	}

	shutdown(): Promise<void> {
		return Promise.resolve()
	}

	share(name: string, value: any) {
		throw new Error('Subclasses must implement.')
	}

	extend(name: string, extension: string) {
		throw new Error('Subclasses must implement.')
	}

	render(name: string, context: any) {
		throw new Error('Subclasses must implement.')
	}

	writeCache() {
		throw new Error('Subclasses must implement.')
	}

	clearCache() {
		throw new Error('Subclasses must implement.')
	}

	toHtmlString(html: any): any {
		throw new Error('Subclasses must implement.')
	}

	isHtmlString(html: any): boolean {
		throw new Error('Subclasses must implement.')
	}
}
