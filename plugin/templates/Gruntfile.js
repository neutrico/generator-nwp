/*
 * (c) Marcin Antczak 2013.07.10
 *
 * Directories structure simmilar to Maven
 *
 * doc                 - source files for documentation (org format mainly)
 * src                 - source files
 * src/main            - sources for main application
 * src/main/javascript -
 *
 * src/main/php        - php
 *
 * target              - files generated on build task goes there
 * target/devel        - files generated on development stage goes there
 * target/devel/css    - compass cannot compile directly to sandbox server
 *
 * target/dist         - files generated with build task goes there
 *
 * - ThemeForest Theme package
 *
 * target/dist/Documentation
 * target/dist/Licensing
 * target/dist/Sample
 * target/dist/Theme
 *
 * Build lifecycle based on Maven with single modification
 * we initialize first and validate later in this way we can compile
 * scss to css and coffee to js and run csslint and jshint on output
 *
 * - clean
 *
 * - initialize - initialize build state
 * - validate   - validate the project is correct
 * - compile    - compile the source code of the project
 * - test       - run tests using test framework
 * - package    - take the compiled code and package in dist format
 * - verify     - run check to verify the package is valid
 * - install    - install into the local repo
 * - deploy     - copy final package to the remote repo
 *
 */

module.exports = function (grunt) {

	'use strict';

	// load all grunt tasks
	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

	grunt.initConfig({
		// source package.json to get properties
		pkg: grunt.file.readJSON('package.json'),

		bower: {
			dir: 'src/main/javascript/vendor'
		},

		/**
		 * Clean
		 *
		 * remove generated files
		 *
		 */
		clean: {
			initialize: {
				files: [
					{
						dot: true,
						src: [
							'<%= pkg.config.dir.target %>'
						]
					}
				]
			}
		},

		/**
		 * Coffee
		 *
		 * compile coffee script to javascript
		 *
		 */
		coffee: {
			compile: {
				files: [{
					expand: true,
					cwd: '<%= pkg.config.dir.src %>/coffee',
					src: '{,*/}*.coffee',
					dest: '<%= pkg.config.dir.theme %>/assets/js',
					ext: '.js'
				}]
			}
		},

		/**
		 * Compass
		 *
		 * compile scss to css
		 *
		 */
		compass: {
			options: {
				sassDir: '<%= pkg.config.dir.src %>/scss',
				cssDir: '<%= pkg.config.dir.theme + "/" + pkg.config.slug %>/assets/css',
				relativeAssets: false,
				outputStyle: 'expanded',
				force: true
			},

			// on compile keep line_comments on
			compile: {
				options: {
					environment: 'development'
				}
			},

			// on deploy remove line_comments
			pkg: {
				options: {
					environment: 'production'
				}
			}
		},

		/**
		 * Compress
		 *
		 * prepare distributable zip packages
		 *
		 */
		compress: {
			'theme-neutrico': {
				options: {
					archive: '<%= pkg.config.dir.target + "/neutrico/" + pkg.config.slug %>.zip'
				},
				expand: true,
				cwd: '<%= pkg.config.dir.theme %>/',
				src: ['**/*']
			},

			'theme-tf': {
				options: {
					archive: '<%= pkg.config.dir.target + "/tf/" + pkg.config.slug %>.zip'
				},
				expand: true,
				cwd: '<%= pkg.config.dir.theme %>/',
				src: ['**/*']
			},

			'preview-tf': {
				options: {
					archive: '<%= pkg.config.dir.target + "/tf/" + pkg.config.slug + "_preview-" + pkg.version %>.zip'
				},
				expand: true,
				cwd: '<%= pkg.config.dir.preview %>',
				src: ['**/*']
			},

			'pkg-tf': {
				options: {
					archive: '<%= pkg.config.dir.target + "/tf/" + pkg.config.slug + "_dist-" + pkg.version %>.zip'
				},
				expand: true,
				cwd: '<%= pkg.config.dir.dist %>/',
				dest: '<%= pkg.config.slug + "-" + pkg.version %>/',
				src: ['**/*']
			}
		},

		/**
		 * Concurrent
		 *
		 * run time consuming tasks concurrently
		 *
		 */
		concurrent: {
			compile: [
				'compass:compile',
				'coffee:compile'
			],
			initialize: [
				'replace:initialize',
				'copy:javascript',
				'copy:resources',
				'copy:vendor'
			],
			pkg: [
				'phpdocumentor:pkg',
				'cssmin:pkg',
				'imagemin:pkg',
				'svgmin:pkg',
				'uglify:pkg'
			]
		},

		/**
		 * Copy
		 *
		 * copy required resource files to target
		 *
		 */
		copy: {
			javascript: {
				files: [{
					expand: true,
					cwd: '<%= pkg.config.dir.src %>/javascript',
					src: ['**/*'],
					dest: '<%= pkg.config.dir.theme + "/" + pkg.config.slug %>/assets/js'
				}]
			},
			resources: {
				files: [{
					expand: true,
					cwd: '<%= pkg.config.dir.src %>/resources',
					src: ['fonts/**/*', 'images/**/*', 'lang/**/*'],
					dest: '<%= pkg.config.dir.theme + "/" + pkg.config.slug  %>/assets/'
				}]
			},
			vendor: {
				files: [{
					expand: true,
					cwd: '<%= pkg.config.dir.src %>/php/vendor',
					src: ['**/*'],
					dest: '<%= pkg.config.dir.theme + "/" + pkg.config.slug  %>/vendor/'
				}]
			},
			'licensing-tf': {
				files: [{
					expand: true,
					dot: false,
					cwd: 'doc/licensing-tf/wp',
					dest: '<%= pkg.config.dir.license %>',
					src: ['**/*']
				}]
			},
			'preview-tf': {
				files: [{
					expand: true,
					dot: false,
					cwd: '<%= pkg.config.dir.src %>/resources/preview',
					dest: '<%= pkg.config.dir.preview %>',
					src: ['**/*']
				}]
			}
		},

		/**
		 * Csslint
		 *
		 * Lint CSS Files
		 *
		 */
		csslint: {
			options: {
				import: false,
				'box-model': false,
				'box-sizing': false,
				'compatible-vendor-prefixes': false,
				'duplicate-background-images': false,
				'duplicate-properties': false,
				'empty-rules': false,
				'fallback-colors': false,
				'font-sizes': false,
				'overqualified-elements': false,
				'qualified-headings': false,
				'regex-selectors': false,
				'unique-headings': false,
				'universal-selector': false,
				'unqualified-attributes': false

			},
			src: [ '<%= pkg.config.dir.theme + "/" + pkg.config.slug %>/css/*.css' ]
		},

		/**
		 * Cssmin
		 *
		 * minify css files for production
		 *
		 */
		cssmin: {

			pkg: {
				options: {
					banner: '/*!\n  @project   <%= pkg.name %>\n  @version   <%= pkg.version %>\n\n  @author    <%= pkg.author.name + "<" + pkg.author.email + ">" %> \n  @copyright <%= grunt.template.today("yyyy") + " " + pkg.author.name %> \n */'
				},
				expand: true,
				cwd: '<%= pkg.config.dir.theme + "/" + pkg.config.slug %>/assets/css',
				src: ['*.css', '!*.min.css'],
				dest: '<%= pkg.config.dir.theme + "/" + pkg.config.slug %>/assets/css',
				ext: '.min.css'
			}

		},

		/**
		 * FTP Deploy
		 *
		 * deploy packages to ftp server
		 *
		 */
		'ftp-deploy': {
			'tf': {
				auth: {
					host:'ftp.marketplace.envato.com',
					port: 21,
					authKey: 'envato'
				},
				src: '<%= pkg.config.dir.target %>/tf/',
				dest: '',
				exclusions: ['<%= pkg.config.dir.target %>/tf/*.php']

			}
		},

		imagemin: {
			pkg: {
				files: [{
					expand: true,
					cwd: '<%= pkg.config.dir.theme + "/" + pkg.config.slug %>/assets/img',
					src: '{,*/}*.{png,jpg,jpeg}',
					dest: '<%= pkg.config.dir.theme + "/" + pkg.config.slug %>/assets/img'
				}]
			}
		},

		/**
		 * JSHint
		 *
		 * test js syntax
		 *
		 */
		jshint: {
			options: {
				bitwise: true,
				camelcase: true,
				browser: true,
				curly: true,
				eqeqeq: true,
				esnext: true,
				immed: true,
				indent: 2,
				latedef: true,
				newcap: true,
				noarg: true,
				node: true,
				quotmark: 'single',
				regexp: true,
				smarttabs: true,
				strict: true,
				trailing: true,
				undef: true,
				globals: {
					// Webfonts
					webfonts: true,
					WebFont: true,
					// AMD
					module: true,
					require: true,
					requirejs: true,
					define: true,

					// Environments
					console: true,

					// General Purpose Libraries
					$: true,
					jQuery: true,

					// Testing
					sinon: true,
					describe: true,
					it: true,
					expect: true,
					beforeEach: true,
					afterEach: true
				}
			},
			all: [
				'<%= pkg.config.dir.src %>/javascript/{,*/}*.js',
				'!<%= pkg.config.dir.src %>/javascript/vendor/*'
			]
		},

		/**
		 * Open
		 *
		 * open url in browser
		 *
		 */
		open: {
			devel: {
				path: '<%= pkg.config.sandbox.url %>'
			}
		},

		/**
		 * PHP Documentor
		 *
		 * generate PHP API documentation
		 *
		 */
		phpdocumentor: {
			pkg: {
				bin: '/usr/bin/phpdoc',
				directory: '<%= pkg.config.dir.theme + "/" + pkg.config.slug %>/',
				target: '<%= pkg.config.dir.doc %>'
			}
		},

		/**
		 * Replace
		 *
		 * replace tokens in source files
		 *
		 */
		replace: {
			// licenses
			// 'gpl': '<%= pkg.licenses[0].type %>',
			// 'gplurl': '<%= pkg.licenses[0].url %>',
			// 'tf': '<%= pkg.licenses[1].type %>',
			// 'tfurl': '<%= pkg.licenses[1].url %>',
			// 'npl': '<%= pkg.licenses[2].type %>',
			// 'nplurl': '<%= pkg.licenses[2].url %>',
			'tf-js': {
				options: {
					variables: {
						'name': '<%= pkg.name %>',
						'author': '<%= pkg.author.name %>',
						'authormail': '<%= pkg.author.email %>',
						'version': '<%= pkg.version %>',
						'inceptionyear': '<%= grunt.template.today("yyyy") %>',
						'timestamp': '<%= grunt.template.today("isoDateTime") %>',
						'licensetype': '<%= pkg.licenses[1].type %>',
						'licenseurl': '<%= pkg.licenses[1].url %>'
					}
				},
				files: [
					{
						cwd: '<%= pkg.config.dir.theme + "/" + pkg.config.slug %>/assets/js',
						expand: true,
						flatten: false,
						src: '**/*.js',
						dest: '<%= pkg.config.dir.theme + "/" + pkg.config.slug %>/assets/js'

					}
				]
			},
			'tf-css': {
				options: {
					variables: {
						'name': '<%= pkg.name %>',
						'author': '<%= pkg.author.name %>',
						'authormail': '<%= pkg.author.email %>',
						'version': '<%= pkg.version %>',
						'inceptionyear': '<%= grunt.template.today("yyyy") %>',
						'timestamp': '<%= grunt.template.today("isoDateTime") %>',
						'licensetype': '<%= pkg.licenses[1].type %>',
						'licenseurl': '<%= pkg.licenses[1].url %>'
					}
				},
				files: [
					{
						cwd: '<%= pkg.config.dir.theme + "/" + pkg.config.slug %>/assets/css',
						expand: true,
						flatten: false,
						src: '**/*.css',
						dest: '<%= pkg.config.dir.theme + "/" + pkg.config.slug %>/assets/css'

					}
				]
			},
			'neutrico-css': {
				options: {
					variables: {
						'name': '<%= pkg.name %>',
						'author': '<%= pkg.author.name %>',
						'authormail': '<%= pkg.author.email %>',
						'version': '<%= pkg.version %>',
						'inceptionyear': '<%= grunt.template.today("yyyy") %>',
						'timestamp': '<%= grunt.template.today("isoDateTime") %>',
						'licensetype': '<%= pkg.licenses[2].type %>',
						'licenseurl': '<%= pkg.licenses[2].url %>'
					}
				},
				files: [
					{
						cwd: '<%= pkg.config.dir.theme + "/" + pkg.config.slug %>/assets/css',
						expand: true,
						flatten: false,
						src: '**/*.css',
						dest: '<%= pkg.config.dir.theme + "/" + pkg.config.slug %>/assets/css'

					}
				]
			},

			'neutrico-js': {
				options: {
					variables: {
						'name': '<%= pkg.name %>',
						'author': '<%= pkg.author.name %>',
						'authormail': '<%= pkg.author.email %>',
						'version': '<%= pkg.version %>',
						'inceptionyear': '<%= grunt.template.today("yyyy") %>',
						'timestamp': '<%= grunt.template.today("isoDateTime") %>',
						'licensetype': '<%= pkg.licenses[2].type %>',
						'licenseurl': '<%= pkg.licenses[2].url %>'
					}
				},
				files: [
					{
						cwd: '<%= pkg.config.dir.theme + "/" + pkg.config.slug %>/assets/js',
						expand: true,
						flatten: false,
						src: '**/*.js',
						dest: '<%= pkg.config.dir.theme + "/" + pkg.config.slug %>/assets/js'

					}
				]
			},
			'neutrico-api': {
				options: {
					variables: {
						'name': '<%= pkg.name %>',
						'description': '<%= pkg.description %>',
						'url': '<%= pkg.homepage %>',
						'dnlurl': '<%= pkg.config.dnlurl %>',
						'supporturl': '<%= pkg.config.supporturl %>',

						'author': '<%= pkg.author.name %>',
						'authorurl': '<%= pkg.author.url %>',
						'authormail': '<%= pkg.author.mail %>',

						'inceptionyear': '<%= grunt.template.today("yyyy") %>',
						'version': '<%= pkg.version %>',

						// licenses
						'gpl': '<%= pkg.licenses[0].type %>',
						'gplurl': '<%= pkg.licenses[0].url %>',
						'tf': '<%= pkg.licenses[1].type %>',
						'tfurl': '<%= pkg.licenses[1].url %>',
						'npl': '<%= pkg.licenses[2].type %>',
						'nplurl': '<%= pkg.licenses[2].url %>',

						// joined licenses
						'license': '<%= _.pluck(pkg.licenses, "type").join(", ") %>',
						'licuri': '<%= _.pluck(pkg.licenses, "url").join(", ") %>',

						'tags': '<%= pkg.config.tags %>',
						'textdomain': '<%= pkg.config.textdomain.name %>',
						'domainpath': '<%= pkg.config.textdomain.path %>',
						'timestamp': '<%= grunt.template.today("isoDateTime") %>',

						'requireswp': '<%= pkg.config.requireswp %>',
						'testedwp': '<%= pkg.config.testedwp %>',
						'typewppath': '<%= pkg.config.typewpmenu %>',
						'typewpmenu': '<%= pkg.config.typewppath %>'
					}
				},
				files: [
					{
						src: '<%= pkg.config.dir.src %>/config/api.php',
						dest: '<%= pkg.config.dir.target + "/neutrico/" + pkg.config.slug %>.php'
					}
				]
			},
			'tf-api': {
				options: {
					variables: {
						'name': '<%= pkg.name %>',
						'description': '<%= pkg.description %>',
						'url': '<%= pkg.homepage %>',
						'dnlurl': '<%= pkg.config.dnlurl %>',
						'supporturl': '<%= pkg.config.supporturl %>',

						'author': '<%= pkg.author.name %>',
						'authorurl': '<%= pkg.author.url %>',
						'authormail': '<%= pkg.author.mail %>',

						'inceptionyear': '<%= grunt.template.today("yyyy") %>',
						'version': '<%= pkg.version %>',

						// licenses
						'gpl': '<%= pkg.licenses[0].type %>',
						'gplurl': '<%= pkg.licenses[0].url %>',
						'tf': '<%= pkg.licenses[1].type %>',
						'tfurl': '<%= pkg.licenses[1].url %>',
						'npl': '<%= pkg.licenses[2].type %>',
						'nplurl': '<%= pkg.licenses[2].url %>',

						// joined licenses
						'license': '<%= _.pluck(pkg.licenses, "type").join(", ") %>',
						'licuri': '<%= _.pluck(pkg.licenses, "url").join(", ") %>',

						'tags': '<%= pkg.config.tags %>',
						'textdomain': '<%= pkg.config.textdomain.name %>',
						'domainpath': '<%= pkg.config.textdomain.path %>',
						'timestamp': '<%= grunt.template.today("isoDateTime") %>',

						'requireswp': '<%= pkg.config.requireswp %>',
						'testedwp': '<%= pkg.config.testedwp %>',
						'typewppath': '<%= pkg.config.typewpmenu %>',
						'typewpmenu': '<%= pkg.config.typewppath %>'
					}
				},
				files: [
					{
						src: '<%= pkg.config.dir.src %>/config/api.php',
						dest: '<%= pkg.config.dir.target + "/tf/" + pkg.config.slug %>.php'
					}
				]
			},

			initialize: {

				files: [
					// main theme descriptor
					{
						// expand: true,
						// flatten: false,
						src: ['<%= pkg.config.dir.src %>/resources/css/style.css'],
						dest: '<%= pkg.config.dir.theme + "/" + pkg.config.slug %>/style.css'
					},
					// php code
					{
						cwd: '<%= pkg.config.dir.src %>/php/',
						expand: true,
						flatten: false,
						src: '**/*.php',
						dest: '<%= pkg.config.dir.theme + "/" + pkg.config.slug %>/'
					}
				],
				options: {
					variables: {
						'name': '<%= pkg.name %>',
						'description': '<%= pkg.description %>',
						'url': '<%= pkg.homepage %>',

						'author': '<%= pkg.author.name %>',
						'authormail': '<%= pkg.author.email %>',
						'authorurl': '<%= pkg.author.url %>',

						'version': '<%= pkg.version %>',
						'inceptionyear': '<%= grunt.template.today("yyyy") %>',

						// licenses
						'gpl': '<%= pkg.licenses[0].type %>',
						'gplurl': '<%= pkg.licenses[0].url %>',
						'tf': '<%= pkg.licenses[1].type %>',
						'tfurl': '<%= pkg.licenses[1].url %>',
						'npl': '<%= pkg.licenses[2].type %>',
						'nplurl': '<%= pkg.licenses[2].url %>',

						'license': '<%= _.pluck(pkg.licenses, "type").join(", ") %>',
						'licuri': '<%= _.pluck(pkg.licenses, "url").join(", ") %>',

						'tags': '<%= pkg.config.tags %>',
						'textdomain': '<%= pkg.config.textdomain.name %>',
						'domainpath': '<%= pkg.config.textdomain.path %>',
						'timestamp': '<%= grunt.template.today("isoDateTime") %>'
					}
				}
			}
		},

		/**
		 * FTP Deploy
		 *
		 * deploy packages to ftp server
		 *
		 */
		'sftp-deploy': {
			'neutrico-item': {
				auth: {
					host:'ec2-54-228-41-224.eu-west-1.compute.amazonaws.com',
					port: 22,
					authKey: 'neutrico'
				},
				src: '<%= pkg.config.dir.target %>/neutrico/',
				dest: '/home/uploader/uploads',
				exclusions: ['<%= pkg.config.dir.target %>/neutrico/*.php']

			},
			'neutrico-api': {
				auth: {
					host:'ec2-54-228-41-224.eu-west-1.compute.amazonaws.com',
					port: 22,
					authKey: 'neutrico'
				},
				src: '<%= pkg.config.dir.target %>/neutrico/',
				dest: '/home/uploader/downloads/packages',
				exclusions: ['<%= pkg.config.dir.target %>/neutrico/*.zip']
			},
			'neutrico-tf-item': {
				auth: {
					host:'ec2-54-228-41-224.eu-west-1.compute.amazonaws.com',
					port: 22,
					authKey: 'neutrico'
				},
				src: '<%= pkg.config.dir.target %>/tf',
				dest: '/home/uploader/uploads',
				exclusions: ['<%= pkg.config.dir.target %>/tf/*_*.zip', '<%= pkg.config.dir.target %>/tf/*.php']
			},
			'neutrico-tf-api': {
				auth: {
					host:'ec2-54-228-41-224.eu-west-1.compute.amazonaws.com',
					port: 22,
					authKey: 'neutrico'
				},
				src: '<%= pkg.config.dir.target %>/tf',
				dest: '/home/uploader/downloads/packages',
				exclusions: ['<%= pkg.config.dir.target %>/tf/*.zip']
			}
		},

		/**
		 * Shell
		 *
		 * run shell command
		 *
		 */
		shell: {
			/*
			 * unused currently will be used to publish documentation
			 * in org format to html using emacs in bash mode
			 */
		},

		svgmin: {
			pkg: {
				files: [{
					expand: true,
					cwd: '<%= pkg.config.dir.theme + "/" + pkg.config.slug %>/images',
					src: '{,*/}*.svg',
					dest: '<%= pkg.config.dir.theme + "/" + pkg.config.slug %>/images'
				}]
			}
		},

		/**
		 * Sync
		 *
		 * synchronize theme directory with sandbox
		 *
		 */
		sync: {
			watch: {
				files: [{
					cwd: '<%= pkg.config.dir.theme + "/" + pkg.config.slug %>',
					src: '**/*.*',
					dest: '<%= pkg.config.sandbox.path + "/" + pkg.config.slug %>'
				}]
			},
			vendor: {
				files: [{
					cwd: '<%= pkg.config.dir.src %>/php/vendor',
					src: '**/*.*',
					dest: '<%= pkg.config.dir.theme + "/" + pkg.config.slug %>/vendor'
				}]
			}
		},

		/**
		 * Uglify
		 *
		 *
		 */
		uglify: {
			options: {
				banner: '/**\n * @name      <%= pkg.name %>\n * @version   <%= pkg.version %>\n * \n * @author    <%= pkg.author.name + "<" + pkg.author.email + ">" %> \n * @copyright <%= grunt.template.today("yyyy") + " " + pkg.author.name %> \n */\n'
			},
			pkg: {
				files: [{
					expand: true,
					ext: '.min.js',
					cwd: '<%= pkg.config.dir.theme + "/" + pkg.config.slug %>/assets/js',
					src: '**/*.js',
					dest: '<%= pkg.config.dir.theme + "/" + pkg.config.slug %>/assets/js'
				}]
			}
		},

		/**
		 * Watch
		 *
		 * watch changes in sources
		 *
		 */
		watch: {

			options: {
				nospawn: false
			},

			coffee: {
				files: ['<%= pkg.config.dir.src %>/coffee/{,*/}*.coffee'],
				tasks: ['coffee:compile', 'sync:watch']
			},

			coffeeTest: {
				files: ['test/spec/{,*/}*.coffee'],
				tasks: ['coffee:test', 'sync:watch']
			},

			compass: {
				files: ['<%= pkg.config.dir.src %>/scss/{,*/}*.{scss,sass}'],
				tasks: ['compass:compile', 'sync:watch']
			},

			php: {
				files: ['<%= pkg.config.dir.src %>/php/**/*.php'],
				tasks: ['replace:initialize', 'sync:watch']
			},
			vendor: {
				files: ['<%= pkg.config.dir.src %>/php/vendor/**/*'],
				tasks: ['sync:vendor', 'sync:watch']
			}
		}
	});

	/**
	 * Build lifecycle tasks
	 *
	 *
	 * Initialize
	 *
	 */
	grunt.registerTask('initialize', [
		'clean:initialize',
		'concurrent:initialize'
	]);

	/**
	 * Compile
	 *
	 * compile source code and sync with sandbox server
	 * run compile as default task on the fly with watch
	 */
	grunt.registerTask('compile', [
		'initialize',
		'concurrent:compile',
		'sync:watch'
	]);

	/**
	 * Validate
	 *
	 * validate the project is correct and all
	 * necessary information is available.
	 */
	grunt.registerTask('validate', [
		'compile',
		'csslint',
		'jshint'
	]);

	grunt.registerTask('test', [
		'validate'
		// @todo mocha test
	]);


	/**
	 * Package for Neutrico
	 */
	grunt.registerTask('pkg-neutrico', [
		'test',

		// recompile css with production settings
		'compass:pkg',
		'concurrent:pkg',

		'replace:neutrico-api',
		'replace:neutrico-css',
		'replace:neutrico-js',

		'compress:theme-neutrico'
	]);

	/**
	 * Package for ThemeForest
	 */
	grunt.registerTask('pkg-tf', [
		'test',

		// recompile css with production settings
		'compass:pkg',
		'concurrent:pkg',

		'replace:tf-api',
		'replace:tf-css',
		'replace:tf-js',

		'copy:preview-tf',
		'copy:licensing-tf',

		'compress:theme-tf',
		'compress:preview-tf',
		'compress:pkg-tf'
	]);

	grunt.registerTask('package', [
		'pkg-neutrico',
		'pkg-themeforest'
	]);

	/**
	 * Deploy to neutrico server via sftp
	 */
	grunt.registerTask('dpl-neutrico', [
		'pkg-neutrico',
		'sftp-deploy:neutrico-api',
		'sftp-deploy:neutrico-item'
	]);

	/**
	 * Deploy to themeforest ftp server
	 */
	grunt.registerTask('dpl-tf', [
		'pkg-tf',
		'ftp-deploy:tf',
		'sftp-deploy:neutrico-tf-item',
		'sftp-deploy:neutrico-tf-api'
	]);

	/**
	 * deploy to both neutrico and tf
	 */
	grunt.registerTask('deploy', [
		'dpl-neutrico',
		'dpl-tf'
	]);

	// on default task build sandbox version and wait for changes
	grunt.registerTask('default', [
		'open',
		'compile',
		'watch'
	]);
};