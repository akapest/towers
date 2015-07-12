gulp = require 'gulp'
gutil = require 'gulp-util'
config = (require '../config').vendor
uglify = require '../_uglify'
handleErrors = require '../_handleErrors'
concat = require 'gulp-concat'

gulp.task 'vendor',
  [ 'vendor-css',
    'vendor-images'
    'vendor-scripts' ]



gulp.task 'vendor-css', () ->

  gulp.src(config.css.src)
      .on('error', handleErrors)
      .pipe(concat(config.css.name))
      .pipe(gulp.dest config.css.dest)


gulp.task 'vendor-images', () ->

  gulp.src(config.images.src)
      .on('error', handleErrors)
      .pipe(gulp.dest config.images.dest)

gulp.task 'vendor-scripts', () ->

  gulp.src(config.scripts.src)
      .on('error', handleErrors)
      .pipe(concat(config.scripts.name))
      .pipe(uglify())
      .pipe(gulp.dest config.scripts.dest)

