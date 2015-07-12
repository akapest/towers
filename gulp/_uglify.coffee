gulp         = require 'gulp'
gutil        = require 'gulp-util'
gulpif       = require 'gulp-if'
uglify       = require 'gulp-uglify'
streamify    = require 'gulp-streamify'
handleErrors = require './_handleErrors'

module.exports = () ->

  gulpif(global.isProd, streamify(uglify({
          compress: { drop_console: true }
        })))