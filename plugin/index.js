/**
 * Plugin
 */

'use strict';

var util   = require('util'),
	path   = require('path'),
	yeoman = require('yeoman-generator'),
	config = require('./../config.js');

var NwpGenerator = module.exports = function Generator(args, options) {
	yeoman.generators.Base.apply(this, arguments);

	this.sourceRoot(path.join(__dirname, 'templates'));

	this.on('end', function () {
		this.installDependencies({ skipInstall: options['skip-install'] });
	});

	this.pkg = JSON.parse(this.readFileAsString(path.join(__dirname, '../package.json')));
};

util.inherits(NwpGenerator, yeoman.generators.NamedBase);

NwpGenerator.prototype.getConfig = function getConfig() {
	var cb   = this.async(),
		self = this;

	self.defaultAuthorEmail = '';
	self.defaultAuthorName = '';
	self.defaultAuthorURI = '';
	self.configExists = false;

	config.getConfig(function(err, data) {
		if (!err) {
			self.defaultAuthorEmail = data.authorEmail;
			self.defaultAuthorName = data.authorName;
			self.defaultAuthorURI = data.authorURI;
		}
		cb();
	});
};

NwpGenerator.prototype.askFor = function askFor() {

	var test = 'This is plugin Name';

	this.log.writeln(test.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}).replace(/\s+/g,"_"));

	var cb   = this.async(),
		self = this,
		_ = require('underscore'),
		initialPrompts = [],
		extendedPrompts = [],
		prompts,
		values;

	initialPrompts = [{
		type: 'input',
		name: 'pluginName',
		message: 'Name of the plugin: ',
		default: 'myPlugin'
	},{
		type: 'input',
		name: 'pluginDescription',
		message: 'Plugin description: ',
		default: 'Plugin description'
	},{
		type: 'input',
		name: 'pluginUrl',
		message: 'Plugin URL: ',
		default: 'Plugin URL'
	}];

	if (!self.configExists) {
		extendedPrompts = [ {
			type: 'input',
			name: 'pluginAuthorEmail',
			message: 'Author Email',
			default: self.defaultAuthorEmail
		},{
			type: 'input',
			name: 'pluginAuthorName',
			message: 'Author Name: ',
			default: self.defaultAuthorName
		},{
			type: 'input',
			name: 'pluginAuthorURI',
			message: 'Author URI: ',
			default: self.defaultAuthorURI
		}];
	}
	prompts = _.union( initialPrompts, extendedPrompts );

	self.prompt(prompts,function(props) {
							self.pluginName   = props.pluginName;
							self.pluginDescription   = props.pluginDescription;
							self.pluginUrl   = props.pluginUrl;
							self.pluginAuthorEmail = props.pluginAuthorEmail;
							self.pluginAuthorName = props.pluginAuthorName;
							self.pluginAuthorURI = props.pluginAuthorURI;
							if (!self.configExists) {
								values = {
									authorEmail: self.pluginAuthorEmail,
									authorName: self.pluginAuthorName,
									authorURI: self.pluginAuthorURI
								};
								config.createConfig(values, cb);
							} else {
								cb();
							}
						}.bind(this));
};

NwpGenerator.prototype.createPlugin = function createPlugin() {
	var _ = require('underscore');

	_.str = require('underscore.string');
	_.mixin(_.str.exports());
	_.str.include('Underscore.string', 'string'); // => true

	this.mkdir('doc');
	this.mkdir('src/main/php');
	this.mkdir('src/main/javascript');
	this.mkdir('src/main/javascript/vendor');
	this.mkdir('src/main/resources/css');
	this.mkdir('src/main/resources/fonts');
	this.mkdir('src/main/resources/images');
	this.mkdir('src/main/resources/lang');

	this.template('php/_index.php', 'src/main/php/index.php');
	this.template('php/_uninstall.php', 'src/main/php/uninstall.php');
	this.template('php/_plugin-name.php', 'src/main/php/' + _.slugify( this.pluginName ) + '.php');
	this.template('php/_class-plugin-name.php', 'src/main/php/class-' + _.slugify( this.pluginName ) + '.php' );

	this.template('lang/plugin-name.pot', 'src/main/resources/lang/' + _.slugify( this.pluginName) + '.pot' );
};

NwpGenerator.prototype.scripts = function scripts() {
	this.copy('js/admin.js', 'src/main/javascript/admin.js');
	this.copy('js/main.js', 'src/main/javascript/main.js');
};

NwpGenerator.prototype.styles = function styles() {
	this.copy('css/admin.css', 'src/main/resources/css/admin.css');
	this.copy('css/main.css', 'src/main/resources/css/main.css');
};

NwpGenerator.prototype.bower = function bower() {
  this.copy('_bowerrc', '.bowerrc');
  this.copy('_bower.json', 'bower.json');
};

NwpGenerator.prototype.packageJSON = function packageJSON() {
	this.template('_package.json', 'package.json');
};

NwpGenerator.prototype.gruntfile = function gruntfile() {
	this.copy('Gruntfile.js', 'Gruntfile.js');
};

NwpGenerator.prototype.goodbye = function goodbye() {
	this.log.writeln('Plugin created successfully');
};
