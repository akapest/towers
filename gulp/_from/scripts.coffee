
gulp         = require('gulp')
browserify   = require('browserify')
browserSync  = require 'browser-sync'
watchify     = require('watchify')
mergeStream  = require('merge-stream')
bundleLogger = require('../util/bundleLogger')
handleErrors = require('../util/handleErrors')
source       = require('vinyl-source-stream')
plumber      = require('gulp-plumber')
config       = require('../config')
through      = require('through2').obj
_            = require('lodash')


gulp.task 'scripts', () ->
  watch = process.env.NODE_ENV != 'production'

  return buildScripts(config.scripts, {watch: watch, dev: true})


buildScripts = (config, opts) ->
  config = _.extend(config, { debug: opts.dev == true })
  if(opts.watch)
    config = _.extend(config, watchify.args)

  worker = browserify(config, opts)

  if(opts.watch)
    worker = watchify(worker, {delay: 100})
    worker.on('update', () -> doMakeBuild(worker, config))
    bundleLogger.watch(config.outputName)

  if(config.require)
    exposeDependencies(worker, config)
  if(config.external)
    moveDependenciesOut(worker, config)

  return doMakeBuild(worker, config)


# Next two methods allow to build separate modules bundles
exposeDependencies = (worker, config) ->
  worker.require(config.require)

moveDependenciesOut = (worker, config) ->
  worker.external(config.external)

# Produces the output file and reloads the app
doMakeBuild = (worker, config) ->
  bundleLogger.start(config.outputName)
  return (
    worker.bundle()
    .on('error', handleErrors) # Report compile errors
    .pipe(source(config.outputName)) # Use vinyl-source-stream to make the stream gulp compatible.
    .pipe(gulp.dest(config.dest))
    .pipe(browserSync.reload({ stream: true }))
    .pipe(through((f, c, callback) ->
        bundleLogger.end(config.outputName)
        callback()
      ))
  )


# Exporting the task so we can call it directly in our watch task, with the 'devMode' option
module.exports = buildScripts
