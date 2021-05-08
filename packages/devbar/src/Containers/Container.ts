import { Devbar } from '../Devbar'

export abstract class Container {
	/**
	 * Name of this container
	 */
	label: string

	/**
	 * Whether or not the container should display
	 */
	shouldDisplay = true

	/**
	 * Create a container instance
	 *
	 * @param  string label Name of the container
	 */
	constructor(label: string) {
		this.label = label
	}

	/**
	 * Number of items in this container
	 */
	get size(): number {
		return 0
	}

	/**
	 * Whether or not this container should show a panel
	 * Default behavior is to return true if size > 0
	 */
	get hasPanel(): boolean {
		return this.size > 0
	}

	/**
	 * Render the container
	 *
	 * @param  Devbar devbar  Instance of the devbar being rendered
	 * @param  Record<string, any> context Context for the current session
	 * @return string         Rendered HTML
	 */
	abstract render(devbar: Devbar, context: Record<string, any>): string
}
