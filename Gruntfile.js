module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      options: {
        separator: ';'
			},
			css: {
				files: [
					{
						src: ['assets/css/*.scss'],
						dest: 'assets/css/compile/style.scss'
					}
				]
			},
      dist: {
        src: ['./assets/js/*.js'],
        dest: 'dist/assets/js/<%= pkg.name %>.js'
      }
		},
		sass: {
		    dist: {
		      options: {
    				sourcemap: 'none',
						style: 'compressed',
						noCache: true
					},
					files: [{
						'dist/assets/css/style.css':'assets/css/compile/style.scss',
					}]
		    }
		},
		copy: {
		  main: {
		    files: [
					{
						expand: true,
						src: ['data/*'],
						dest: 'dist/'
					},
					{
						expand: true,
						src: ['assets/fonts/*'],
						dest: 'dist/'
					}
				]
			}
		},
		imagemin: {
			dynamic: {
				files: [{
					expand: true,
					cwd: 'assets/imgs/',
					src: ['*.{png,jpg,gif,svg}'],
					dest: 'dist/assets/imgs/'
				}]
			}
		},
		includes: {
			build: {
				cwd: 'pages',
				src: [ '*.html'],
				dest: 'dist/',
				options: {
					flatten: true,
					includePath: 'include'
				}
			}
		},
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
      },
      dist: {
        files: {
          'dist/assets/js/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
        }
      }
		},
    qunit: {
      files: ['test/**/*.html']
    },
    jshint: {
      files: ['Gruntfile.js', 'assets/**/*.js', 'test/**/*.js'],
      options: {
        globals: {
          console: true,
          module: true,
          document: true
        }
      }
    },
    watch: {
      files: ['pages/*.html', 'assets/css/*.scss', 'assets/js/*.js', '<%= jshint.files %>'],
      tasks: ['concat', 'sass', 'uglify', 'imagemin', 'includes', 'copy']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-imagemin');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-includes');

  grunt.registerTask('test', ['jshint', 'qunit']);
  grunt.registerTask('default', ['watch']);

};