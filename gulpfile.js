'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var clean = require('gulp-clean');
var usemin = require('gulp-usemin');
var plumber = require('gulp-plumber');
var compass = require('gulp-compass');
var connect = require('gulp-connect');
var ngmin = require('gulp-ngmin');
var uglify = require('gulp-uglify');
var wiredep = require('wiredep').stream;

gulp.task('compass', function() {
    gutil.log(gutil.colors.green('Compile Compass/Sass'));
    gulp.src('./app/styles/*.scss')
        .pipe(plumber())
        .pipe(compass({
            config_file: './config.rb',
            css: 'styles',
            sass: 'styles',
            image: 'app/images'
        }))
        .pipe(gulp.dest('./app/styles'));
    gutil.log('stuff happened', 'Really it did', gutil.colors.cyan('123'));
});

gulp.task('webserver', function() {
    connect.server({
        root: 'app',
        port: 8000
    });
});

gulp.task('clean', function() {
    gulp.src('./www', {
        read: false
    })
        .pipe(clean());
});

gulp.task('bower', function() {
    gulp.src('./app/index.html')
        .pipe(wiredep({}))
        .pipe(gulp.dest('./app'));
});

gulp.task('build', function() {
    gulp.src('./app/index.html')
        .pipe(usemin({}))
        .pipe(gulp.dest('./www/'));

    gulp.src('./app/config.js')
        .pipe(gulp.dest('./www/'));

    gulp.src('./app/views/**/*.html')
        .pipe(gulp.dest('./www/views/'));

    gulp.src('./app/scripts/*.js')
        .pipe(gulp.dest('./www/scripts/'));

    gulp.src(['./app/vendor/**/*.js', './app/vendor/**/*.css'])
        .pipe(gulp.dest('./www/vendor/'));

    gulp.src('./app/vendor/mapbox/images/*')
        .pipe(gulp.dest('./www/vendor/mapbox/images/'));

    gulp.src(['./app/redirect.html', 'app/config.xml', 'app/config.json'])
        .pipe(gulp.dest('./www/'));

    gulp.src(['./app/bower_components/**/fonts/**', './app/bower_components/**/zocial-less/**'])
        .pipe(gulp.dest('./www/bower_components/'));

    gulp.src('./app/images/**/*')
        .pipe(gulp.dest('./www/images/'));
});

gulp.task('watch', function() {
    gutil.log(gutil.colors.green('Watcher started for ./app/styles/**/*.scss'));
    gulp.watch('./app/styles/**/*.scss', ['compass']);
});

gulp.task('default', ['clean', 'bower', 'compass', 'webserver', 'watch']);