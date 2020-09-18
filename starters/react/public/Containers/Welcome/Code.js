import './Code.scss'

export function Code() {
	return (
		<div className="welcome-code">
			<div className="welcome-code-toolbar">
				<span className="welcome-code-toolbar-button"></span>
				<span className="welcome-code-toolbar-button"></span>
				<span className="welcome-code-toolbar-button"></span>
			</div>
			<CodeBlock />
		</div>
	)
}

function CodeBlock() {
	return (
		<pre className="code">
			<code>
				<span className="code-keyword">export&nbsp;function</span>&nbsp;
				<span className="code-func">RoutesProvider</span>(
				<span className="code-param">app</span>)&nbsp;{'{\n'}
				&nbsp;&nbsp;&nbsp;<span className="code-object">app</span>.
				<span className="code-object">routes</span>.<span className="code-func">get</span>(
				<span className="code-string">&apos;/&apos;</span>,&nbsp;(
				<span className="code-param">req</span>,&nbsp;
				<span className="code-param">res</span>)&nbsp;
				<span className="code-keyword">=&gt;</span>&nbsp;{'{\n'}
				&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="code-object">res</span>.
				<span className="code-func">render</span>(
				<span className="code-string">&apos;welcome&apos;</span>,&nbsp;{'{\n'}
				&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;name:&nbsp;
				<span className="code-string">&apos;Grind&apos;</span>
				{'\n'}
				&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{'}'}){'\n'}
				&nbsp;&nbsp;&nbsp;{'}'}).<span className="code-func">as</span>(
				<span className="code-string">&apos;welcome.show&apos;</span>){'\n}'}
			</code>
		</pre>
	)
}
