'use strict';

var gulp         = require('gulp');
var gulpif       = require('gulp-if');
var gutil        = require('gulp-util');
var source       = require('vinyl-source-stream');
var sourcemaps   = require('gulp-sourcemaps');
var buffer       = require('vinyl-buffer');
var watchify     = require('watchify');
var browserify   = require('browserify');
var uglify       = require('../_uglify');
var handleErrors = require('../_handleErrors');
var config       = require('../config').scripts

// Based on: http://blog.avisi.nl/2014/04/25/how-to-keep-a-fast-build-with-browserify-and-reactjs/
function buildScript(file) {

  var bundler = browserify({
    entries: config.entries,
    debug: true,
    cache: {},
    packageCache: {},
    fullPaths: true

  }, watchify.args);

  if (!global.isProd) {
    bundler = watchify(bundler);
    bundler.on('update', function() {
      rebundle();
    });
  }

  var transforms = [
    'brfs',
    'bulkify'
  ];

  transforms.forEach(function(transform) {
    bundler.transform(transform);
  });

  function rebundle() {
    var stream = bundler.bundle();
    var createSourcemap = global.isProd && config.sourcemap;

    gutil.log('Rebundling...');

    return stream.on('error', handleErrors)
        .pipe(source(file))
        .pipe(gulpif(createSourcemap, buffer()))
        .pipe(gulpif(createSourcemap, sourcemaps.init()))
        .pipe(uglify())
        .pipe(gulpif(createSourcemap, sourcemaps.write('./')))
        .pipe(gulp.dest(config.dest))
        .on('end', function(){ gutil.log('Rebundled'); });        
  }

  return rebundle();

}

gulp.task('application-scripts', function() {

  return buildScript(config.bundleName);

});
