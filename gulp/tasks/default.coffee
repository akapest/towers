gulp         = require 'gulp'
gutil        = require 'gulp-util'
gulpif       = require 'gulp-if'

gulp.task 'default',

  [ 'vendor',
    'styles',
    'application-scripts' ]
