var childProcess = require('child_process');

process.argv[0] = '';
process.argv[1] = '';

childProcess.exec('/usr/bin/env which knex', function(err, stdout, stderr) {
	var bin = (stdout || '').trim();

	if (!(bin.length > 0)) {
		console.error('Could not find knex bin.');
		return;
	}

	return require(bin);
});
