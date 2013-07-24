
'use strict';

var path = require('path'),
	fs   = require('fs'),
	home            = process.env.HOME || process.env.USERPROFILE,
	configDirectory = path.join(home, '.yeoman-trs-wordpress'),
	configPath      = path.join(configDirectory, 'config.json');

/**
 *  Create the config file
 *
 *  @param object values Values to write in the config file
 *  @param function cb Callback function
 */
function createConfig(values, cb) {
	var defaults = {
		authorName: 'neutrico.pl',
		authorURI: 'http://www.neutrico.pl'
	},
		configValues = {
			authorName: values.authorName || defaults.authorName,
			authorURI:  values.authorURI || defaults.authorURI
		},

		configData = '{\n\t';

	configData += '"authorName": "'+configValues.authorName+'",\n\t"authorURI": "'+configValues.authorURI+'",\n\t';
	configData += '\n}';

	fs.mkdir(configDirectory, '0777', function() {
		fs.writeFile(configPath, configData, 'utf8', cb);
	});
}

/**
 *  Read the config file
 *  And trigger the callback function with errors and
 *  datas as parameters
 */
function getConfig(cb) {
	try {
		fs.readFile(configPath, 'utf8', function(err, data) {
			if (err) {
				cb(true);
			}
			else {
				cb(false, JSON.parse(data));
			}
		});
	}
	catch(e) {
		cb(true);
	}
}

module.exports = {
	createConfig: createConfig,
	getConfig: getConfig
};
