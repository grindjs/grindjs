module.exports = {
	require: ['@babel/register', '@babel/polyfill'],
	files: ['test/**/*.js', '!test/fixtures/**/*.js', '!test/helpers/**/*.js'],
}
