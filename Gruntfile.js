module.exports = function (grunt) {
    var basePath = 'www/assets/';
    var basePathSrc = basePath + 'src/';
    var jsPath = basePathSrc + 'js/';
    var cssPath = basePathSrc + 'css/';

    var basePathDist = basePath + 'dist/';
    var jsMin = basePathDist + 'js/production.min.js';
    var cssMin = basePathDist + 'css/production.min.css';

    var jsDir = [
        jsPath + 'jquery.js', jsPath + 'bootstrap.js', jsPath + 'ol.js', jsPath + 'ol3-contextmenu-debug.js',
        jsPath + 'modal.js', jsPath + 'photon.js', jsPath + 'contextMenu.js', jsPath + 'popup.js', jsPath + 'map.js'
    ];
    var cssDir = [cssPath + 'bootstrap.css', cssPath + "ol.css", cssPath + "ol3-contextmenu.css", cssPath + "style.css"];

    grunt.initConfig({
        clean: {
            dist: {
                src: ['www/assets/dist/css/*', 'www/assets/dist/js/*']
            }

        },
        uglify: {
            dist: {
                src: jsDir,
                dest: jsMin

            },
            options: {
                report: 'min',
                mangle: true,
                compress: {},
                screwIE8: true,
                preserveComments: 'some'
            }
        },
        cssmin: {
            target: {
                files: [{
                    src: [cssDir],
                    dest: cssMin
                }]
            }
        },
        concat: {
            js: {
                src: jsDir,
                dest: jsMin
            },
            css: {
                src: cssDir,
                dest: cssMin
            }
        },
        copy: {
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: basePathSrc,
                        src: ['fonts/**', 'images/**'],
                        dest: basePathDist
                    }
                ]
            }
        },
        cachebreaker: {
            dist: {
                options: {
                    match: [
                        {
                            'production.min.js': jsMin,
                            'production.min.css': cssMin
                        }
                    ],
                    replacement: 'md5'
                },
                files: {
                    src: ['www/index.html']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-cache-breaker');

    grunt.registerTask('production', ['clean', 'copy', 'uglify', 'cssmin', 'cachebreaker']);
    grunt.registerTask('default', ['clean', 'copy', 'concat', 'cachebreaker']);
};