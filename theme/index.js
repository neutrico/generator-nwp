/**
 * Theme
 */

'use strict';

var util = require('util'),
	path = require('path'),
	yeoman = require('yeoman-generator');

var NwpGenerator = module.exports = function NwpGenerator(args, options) {
	yeoman.generators.Base.apply(this,arguments);

	this.sourceRoot(path.join(__dirname, 'templates'));

	this.on('end', function () {
		this.installDependencies({ skipInstall: options['skip-install'] });
	});

	this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(NwpGenerator, yeoman.generators.Base);

NwpGenerator.prototype.askFor = function askFor() {
	var cb   = this.async(),
		self = this,
		prompts;

	prompts = [{
		name: 'themeName',
		message: 'Theme name: ',
		default: 'myTheme'
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