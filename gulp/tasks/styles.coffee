gulp = require 'gulp'
gutil = require 'gulp-util'
gulpif = require 'gulp-if'
concat = require 'gulp-concat'
less = require 'gulp-less'
autoprefixer = require 'autoprefixer-core'
sourcemaps = require 'gulp-sourcemaps'
postcss = require 'gulp-postcss'
csswring = require 'csswring'
handleErrors = require '../_handleErrors'
main = (require '../config').styles.main
login = (require '../config').styles.login

gulp.task 'styles', [
  'application-styles-main'
  'application-styles-login'
]

processors = [
    autoprefixer({browsers: ['last 2 versions']}),
    csswring
]


gulp.task 'application-styles-main', () ->
  gulp.src(main.src)
      .on('error', handleErrors)
      .pipe(sourcemaps.init())
      .pipe(less())
      .pipe(concat(main.name))
      .pipe(postcss(processors))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest main.dest)

gulp.task 'application-styles-login', () ->
  gulp.src(login.src)
      .on('error', handleErrors)
      .pipe(sourcemaps.init())
      .pipe(concat(login.name))
      .pipe(postcss(processors))
      .pipe(sourcemaps.write('.'))
      .pipe(gulp.dest login.dest)
