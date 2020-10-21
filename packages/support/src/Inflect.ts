const i = require('i/lib/methods')

export const Inflect: {
	camelize(lowerCaseAndUnderscoredWord: string, firstLetterInUppercase: string): string
	classify(tableName: string): string
	dasherize(underscoredWord: string): string
	demodulize(classNameInModule: string): string
	foreign_key(className: string, separateClassNameAndIdWithUnderscore: string): string
	humanize(lowerCaseAndUnderscoredWord: string): string
	ordinalize(number: string): string
	pluralize(word: string): string
	singularize(word: string): string
	tableize(className: string): string
	titleize(word: string): string
	uncountability(word: string): string
	underscore(camelCasedWord: string): string
} = { ...i }
