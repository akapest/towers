'use strict';

/**
 * thx to https://github.com/jakemmarsh/angularjs-gulp-browserify-boilerplate
 */

global.isProd = false;

var index = require('./gulp');
var gulp = require('gulp');

gulp.task('default', ['browserify'], function() {});