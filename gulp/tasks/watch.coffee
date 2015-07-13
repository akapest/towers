gulp        = require 'gulp'
config      = require '../config'

gulp.task 'watch', ['application-scripts'], () ->

  gulp.watch(config.styles.main.src, ['application-styles-main'])
  gulp.watch(config.styles.login.src, ['application-styles-login'])


