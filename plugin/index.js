/**
 * Plugin
 */

'use strict';

var util   = require('util'),
	path   = require('path'),
	fs     = require('fs'),
	yeoman = require('yeoman-generator'),
	config = require('./../config.js');

function Generator(args, options) {
	yeoman.generators.Base.apply(this, arguments);

	this.sourceRoot(path.join(__dirname, 'templates'));
}

module.exports = Generator;

util.inherits(Generator, yeoman.generators.NamedBase);

Generator.prototype.getConfig = function getConfig() {
	var cb   = this.async(),
		self = this;

	self.defaultAuthorName = '';
	self.defaultAuthorURI = '';
	self.configExists = false;

	config.getConfig(function(err, data) {
		if (!err) {
			self.defaultAuthorName = data.authorName;
		}
		cb();
	});
};

Generator.prototype.askFor = function askFor() {
	var cb   = this.async(),
		self = this,
		prompts = [{
			name: 'pluginName',
			message: 'Name of the plugin: ',
			default: 'myPlugin'
		}, {
			name: 'pluginAuthor',
			message: 'Author Name: ',
			default: self.defaultAuthorName
		}];

	this.prompt(prompts, function(e, props) {
		if(e) {
			return self.emit('error', e);
		}

		self.pluginName   = props.pluginName;
		self.pluginAuthor = props.pluginAuthor;

		cb();
	});
};

Generator.prototype.createPlugin = function createPlugin() {
	var cb = this.async();

	this.mkdir('doc');
	this.mkdir('src/main/php');
	this.mkdir('src/main/javascript');
	this.mkdir('src/main/javascript/vendor');
	this.mkdir('src/main/resources/css');
	this.mkdir('src/main/resources/fonts');
	this.mkdir('src/main/resources/images');
	this.mkdir('src/main/resources/lang');

	this.copy('*.php', 'src/main/php');

	this.tarball('https://github.com/tommcfarlin/WordPress-Plugin-Boilerplate/tarball/master', 'app/wp-content/plugins', cb);
};

Generator.prototype.gruntfile = function gruntfile() {
	this.copy('Gruntfile.js', 'Gruntfile.js');
};


Generator.prototype.editFiles = function editFiles(){
	var cb       = this.async(),
		self     = this,
		safeName = self.pluginName.replace(/\ /g, '');

	fs.rename('app/wp-content/plugins/plugin-name', 'app/wp-content/plugins/'+safeName, function() {
		var pluginFile = 'app/wp-content/plugins/'+safeName+'/plugin-name.php';

		fs.readFile(pluginFile, 'utf8', function (err, data) {
			if (err) { throw err; }

			data = data.replace(/^.*Plugin Name: .*$/mg, 'Plugin Name: ' + self.pluginName);
			data = data.replace(/^.*Author: .*$/mg, 'Author: ' + self.pluginAuthor);

			fs.writeFile(pluginFile, data);
			fs.unlink('app/wp-content/plugins/README.md', function() {
				cb();
			});
		});
	});
};

Generator.prototype.goodbye = function goodbye() {
	this.log.writeln('Plugin created successfully');
	this.log.writeln('');
};
