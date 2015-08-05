'use strict';
/*jshint node:true*/
module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);
  var setup = grunt.file.readJSON(__dirname + '/package.json').setup;

  grunt.initConfig({
    copy: {
      bootstrapFonts: {
        files: [{
          cwd: 'node_modules/bootstrap/fonts/',
          expand: true,
          src: ['**/*'],
          dest: setup.target + '/static/fonts/'
        }]
      }
    },

    less: {
      options: {
        paths: ['node_modules']
      },
      styles: {
        files: [{
          src: ['styles/docs.less'],
          dest: setup.target + '/static/css/docs.css'
        }]
      }
    },

    browserify: {
      scripts: {
        files: [{
          src: ['scripts/index.js'],
          dest: setup.target + '/static/js/docs.js'
        }]
      }
    },

    watch: {
      styles: {
        files: ['styles/**/*.less'],
        tasks: ['less:styles']
      },
      scripts: {
        files: ['scripts/**/*.js'],
        tasks: ['browserify:scripts']
      }
    }
  });

  grunt.registerTask('build', ['less:styles', 'browserify:scripts']);

  grunt.registerTask('default', ['build', 'watch']);
};
