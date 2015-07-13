gulp = require 'gulp'
gutil = require 'gulp-util'
config = (require '../config').vendor
uglify = require '../_uglify'
handleErrors = require '../_handleErrors'
concat = require 'gulp-concat'

gulp.task 'vendor',
  [ 'vendor-scripts' ]



gulp.task 'vendor-scripts', () ->

  gulp.src(config.scripts.src)
      .on('error', handleErrors)
      .pipe(concat(config.scripts.name))
      .pipe(uglify())
      .pipe(gulp.dest config.scripts.dest)

