gulp = require 'gulp'
gutil = require 'gulp-util'
gulpif = require 'gulp-if'
concat = require 'gulp-concat'
less = require 'gulp-less'
handleErrors = require '../_handleErrors'
main = (require '../config').styles.main
login = (require '../config').styles.login

gulp.task 'application-styles', [
  'application-styles-main',
  'application-styles-login'
]


gulp.task 'application-styles-main', () ->
  gulp.src(main.src)
      .on('error', handleErrors)
      .pipe(less())
      .pipe(concat(main.name))
      .pipe(gulp.dest main.dest)

gulp.task 'application-styles-login', () ->
  gulp.src(login.src)
      .on('error', handleErrors)
      .pipe(concat(login.name))
      .pipe(gulp.dest login.dest)
