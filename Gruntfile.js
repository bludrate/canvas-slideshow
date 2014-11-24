'use strict';
module.exports = function(grunt) {
    grunt.initConfig({
        express: {
            myServer: {
                options: {
                    port: 9000,
                    bases: 'example',
                    livereload: true
                }
            }
        },

        stylus: {
            options: {
                compress : false
            },
            blocks: {
                files : {
                    'example/styles.css': 'example/styles.styl'
                }
            }
        },

        watch: {
            options: {
                livereload: true,
                spawn: false
            },
            stylus: {
                files: 'example/*.styl',
                tasks: ['stylus']
            },
            reload: {
                files: ['example/*.js', 'example/*.html']
            }
        },

        uglify: {
            options: {
                beautify: false
            },
            js: {
                files: {
                    '<%= config.public %>/<%= config.js %>/main.js': '<%= config.source %>/<%= config.js %>/main.js'
                }
            }
        },

        cssmin: {
            css: {
                files: {
                    '<%= config.public %>/<%= config.css %>/styles.css': '<%= config.source %>/<%= config.css %>/main.css'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-express');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-stylus');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    grunt.registerTask('default', ['express', 'watch']);
    grunt.registerTask('develop', ['stylus', 'express', 'watch']);
};