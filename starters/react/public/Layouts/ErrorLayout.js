import './MasterLayout'

export function ErrorLayout({ children, ...props } = {}) {
	return <MasterLayout {...props}>{children}</MasterLayout>
}
