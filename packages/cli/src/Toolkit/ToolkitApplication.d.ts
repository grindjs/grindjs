import { Application } from '@grindjs/framework'

import { Paths } from './Paths'

export interface ToolkitApplication extends Application {
	stubs: StubGenerator
	paths: Paths
}
