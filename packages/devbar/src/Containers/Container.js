export class Container {

	/**
	 * Name of this container
	 * @type string
	 */
	label = null

	/**
	 * @type Boolean
	 */
	shouldDisplay = true

	/**
	 * Create a container instance
	 *
	 * @param  string label Name of the container
	 */
	constructor(label) {
		this.label = label
	}

	/**
	 * Number of items in this container
	 * @return {[type]} [description]
	 */
	get size() {
		return 0
	}

	/**
	 * Whether or not this container should show a panel
	 * Default behavior is to return true if size > 0
	 */
	get hasPanel() {
		return this.size > 0
	}

	/**
	 * Render the container
	 *
	 * @param  object devbar  Instance of the devbar being rendered
	 * @param  object context Context for the current session
	 * @return string         Rendered HTML
	 */
	render(/* devbar, context */) {
		throw new Error('Subclasses must implement')
	}

}
