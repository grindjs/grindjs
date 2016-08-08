import Nunjucks from 'nunjucks'

export class ViewLoader extends Nunjucks.FileSystemLoader {

	getSource(name) {
		if(name.endsWith('.njk')) {
			name = name.substring(0, name.length - 4)
		}

		return super.getSource(name.replace(/\./, '/') + '.njk')
	}

}
