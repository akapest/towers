gulp         = require 'gulp'
gutil        = require 'gulp-util'
gulpif       = require 'gulp-if'

gulp.task 'dev',

  [ 'vendor',
    'styles',
    'watch' ]
