module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    nodemon: {
      dev: {
        options: {
          ignoredFiles: [
            'README.md',
            'node_modules/**',
            '.gitignore/**',
            '.git/**',
            'public/js/bootstrap.js',
            'public/css/bootstrap.css',
            'public/img/**.*'
          ]
        }
      }
    },
    cssmin: {
      compress:{
        files: {
          './public/css/witness.min.css':['./public/css/bootstrap.flatly.css', './public/css/bootstrap.flat.css','./public/css/1140.css','./public/css/sex.css']
        }
      }
    },
    uglify: {
      options: {
        banner: '/* <%= pkg.name %> \n\n <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        files: {
          './public/js/witness.min.js': ['./public/js/app.js']
        }
      }
    }
  });
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  grunt.registerTask('default',['uglify','cssmin','nodemon']);
};
