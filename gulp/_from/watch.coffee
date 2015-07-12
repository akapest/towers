gulp        = require 'gulp'
scripts     = require './scripts'
config      = require '../config'

gulp.task 'watch', ->

  gulp.watch(config.html.src, ['html'])
  gulp.watch(config.styles.src, ['styles'])

  scripts(config.scripts, {dev: true, watch: true})
