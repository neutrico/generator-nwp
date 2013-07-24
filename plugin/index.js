/**
 * Plugin
 */

'use strict';

var util   = require('util'),
	path   = require('path'),
	yeoman = require('yeoman-generator');
	// fs     = require('fs'),
	// config = require('./../config.js');

var NwpGenerator = module.exports = function Generator(args, options) {
	yeoman.generators.Base.apply(this, arguments);

	this.sourceRoot(path.join(__dirname, 'templates'));

	this.on('end', function () {
		this.installDependencies({ skipInstall: options['skip-install'] });
	});

	this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(NwpGenerator, yeoman.generators.NamedBase);

// NwpGenerator.prototype.getConfig = function getConfig() {
// 	var cb   = this.async(),
// 		self = this;

// 	self.defaultAuthorName = '';
// 	self.defaultAuthorURI = '';
// 	self.configExists = false;

// 	config.getConfig(function(err, data) {
// 		if (!err) {
// 			self.defaultAuthorName = data.authorName;
// 		}
// 		cb();
// 	});
// };

NwpGenerator.prototype.askFor = function askFor() {
	var cb   = this.async(),
		self = this,
		prompts;

	prompts = [{
		name: 'pluginName',
		message: 'Name of the plugin: ',
		default: 'myPlugin'
	}, {
		name: 'pluginAuthor',
		message: 'Author Name: ',
		default: self.defaultAuthorName
	}];

	this.prompt(prompts,function(props) {
							self.pluginName   = props.pluginName;
							self.pluginAuthor = props.pluginAuthor;
							cb();
						}.bind(this));
};

NwpGenerator.prototype.createPlugin = function createPlugin() {
	// var cb = this.async();
	var self = this,
		_ = require('underscore');

	_.str = require('underscore.string');
	// _.mixin(_.str.exports());
	// _.str.include('Underscore.string', 'string'); // => true

	this.mkdir('doc');
	this.mkdir('src/main/php');
	this.mkdir('src/main/javascript');
	this.mkdir('src/main/javascript/vendor');
	this.mkdir('src/main/resources/css');
	this.mkdir('src/main/resources/fonts');
	this.mkdir('src/main/resources/images');
	this.mkdir('src/main/resources/lang');

	this.template('php/plugin-name.php', 'src/main/php/'+ _.slugify(self.pluginName) +'.php');

	// this.tarball('https://github.com/tommcfarlin/WordPress-Plugin-Boilerplate/tarball/master', 'app/wp-content/plugins', cb);
};

NwpGenerator.prototype.gruntfile = function gruntfile() {
	this.copy('Gruntfile.js', 'Gruntfile.js');
};


// NwpGenerator.prototype.editFiles = function editFiles(){
// 	var cb       = this.async(),
// 		self     = this,
// 		safeName = self.pluginName.replace(/\ /g, '');

// 	fs.rename('app/wp-content/plugins/plugin-name', 'app/wp-content/plugins/'+safeName, function() {
// 		var pluginFile = 'app/wp-content/plugins/'+safeName+'/plugin-name.php';

// 		fs.readFile(pluginFile, 'utf8', function (err, data) {
// 			if (err) { throw err; }

// 			data = data.replace(/^.*Plugin Name: .*$/mg, 'Plugin Name: ' + self.pluginName);
// 			data = data.replace(/^.*Author: .*$/mg, 'Author: ' + self.pluginAuthor);

// 			fs.writeFile(pluginFile, data);
// 			fs.unlink('app/wp-content/plugins/README.md', function() {
// 				cb();
// 			});
// 		});
// 	});
// };

NwpGenerator.prototype.goodbye = function goodbye() {
	this.log.writeln('Plugin created successfully');
	this.log.writeln('');
};

NwpGenerator.prototype.packageJSON = function packageJSON() {
	this.template('_package.json', 'package.json');
};
