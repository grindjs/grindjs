require('@babel/register')({
	rootMode: 'upward',
	extensions: ['.jsx', '.js', '.tsx', '.ts'],
})

require('@babel/polyfill')
