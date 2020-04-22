module.exports = {
	require: [require.resolve('./helpers/ava-register')],
	files: ['test/**/*.js', '!test/fixtures/**/*.js', '!test/helpers/**/*.js'],
}
