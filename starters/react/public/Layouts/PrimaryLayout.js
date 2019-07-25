import './MasterLayout'
import './PrimaryLayout/Header'
import './PrimaryLayout/Footer'

export function PrimaryLayout(props) {
	return <MasterLayout
		contentBefore={<Header />}
		contentAfter={<Footer />}
		{...props}
	/>
}
