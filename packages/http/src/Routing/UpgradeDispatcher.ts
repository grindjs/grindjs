import url from 'url'

import { Request } from 'express'

export type UpgradeHandler = (req: Request, socket: any, ...args: any[]) => void

export function UpgradeDispatcher(
	upgraders: Record<string, UpgradeHandler>,
	req: Request,
	socket: any,
	...args: any[]
) {
	;(req as any).pathname = url.parse(req.url).pathname

	// Loop through registered handlers to find a matching upgrader
	for (const [pathname, handler] of Object.entries(upgraders)) {
		if (pathname !== (req as any).pathname) {
			continue
		}

		return handler(req, socket, ...args)
	}

	// If no paths matched, destroy
	socket.destroy()
}
