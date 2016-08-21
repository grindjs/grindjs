import Nunjucks from 'nunjucks'

export class ViewEnvironment extends Nunjucks.Environment {

	resolveTemplate(loader, parentName, filename) {
		if(filename.endsWith('.njk')) {
			filename = filename.substring(0, filename.length - 4)
		}

		return super.resolveTemplate(loader, parentName, filename.replace(/\./g, '/') + '.njk')
	}

}
