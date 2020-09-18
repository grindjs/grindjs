import './RoutingLayout'
import './PrimaryLayout/Header'
import './PrimaryLayout/Footer'

export function PrimaryLayout(props) {
	return <RoutingLayout contentBefore={<Header />} contentAfter={<Footer />} {...props} />
}
