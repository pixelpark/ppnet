'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var clean = require('gulp-clean');
var usemin = require('gulp-usemin');
var watch = require('gulp-watch');
var plumber = require('gulp-plumber');
var compass = require('gulp-compass');
var ngmin = require('gulp-ngmin');
var uglify = require('gulp-uglify');
var imagemin = require('gulp-imagemin');

gulp.task('default', function() {
  gutil.log('stuff happened', 'Really it did', gutil.colors.cyan('123'));
});

gulp.task('compass', function() {
  gulp.src('./app/styles/*.scss')
    .pipe(compass({
      config_file: './config.rb',
      css: 'styles',
      sass: 'styles',
      image: 'app/images'
    }))
    .pipe(gulp.dest('./app/styles'));
});

gulp.task('clean', function() {
  gulp.src('./www', {
    read: false
  })
    .pipe(clean());
});

gulp.task('build', function() {
  gulp.src('./app/index.html')
    .pipe(usemin({}))
    .pipe(gulp.dest('./www/'));

  gulp.src('./app/views/**/*.html')
    .pipe(gulp.dest('./www/views/'));

  gulp.src('./app/scripts/**/*.js')
    .pipe(gulp.dest('./www/scripts/'));

  gulp.src('./app/vendor/**/*.js')
    .pipe(gulp.dest('./www/vendor/'));

  gulp.src(['./app/redirect.html', 'app/config.xml'])
    .pipe(gulp.dest('./www/'));

  gulp.src(['./app/bower_components/**/fonts/**', './app/bower_components/**/zocial-less/**'])
    .pipe(gulp.dest('./www/bower_components/'));

  gulp.src('./app/images/**/*')
    .pipe(gulp.dest('./www/images/'));
});

gulp.task('watch', function() {
  gulp.src('./app/styles/**/*.scss')
    .pipe(watch())
    .pipe(plumber())
    .pipe(compass({
      config_file: './config.rb',
      css: 'styles',
      sass: 'styles',
      image: 'app/images'
    }))
    .pipe(gulp.dest('./app/styles'));
});