import Nunjucks from 'nunjucks'

export class ViewLoader extends Nunjucks.FileSystemLoader {

	getSource(name) {
		if(!name.endsWith('.njk')) {
			name += '.njk'
		}

		return super.getSource(name)
	}

}
