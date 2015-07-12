gulp         = require 'gulp'
gutil        = require 'gulp-util'
gulpif       = require 'gulp-if'

gulp.task 'default',

  [ 'vendor',
    'application-styles',
    'application-scripts' ]
