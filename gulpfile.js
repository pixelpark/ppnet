'use strict';

var gulp = require('gulp'),
    gutil = require('gulp-util'),
    clean = require('gulp-clean'),
    usemin = require('gulp-usemin'),
    plumber = require('gulp-plumber'),
    compass = require('gulp-compass'),
    connect = require('gulp-connect'),
    //ngmin = require('gulp-ngmin'),
    uglify = require('gulp-uglify'),
    wiredep = require('wiredep').stream,
    autoprefixer = require('gulp-autoprefixer'),
    minifyCss = require('gulp-minify-css'),
    imagemin = require('gulp-imagemin'),
    concat = require('gulp-concat'),
    //notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    rename = require('gulp-rename'),
    jshint = require('gulp-jshint');
var flatten = require('gulp-flatten');
var filesize = require('gulp-filesize');

var minifyHtml = require('gulp-minify-html');
var rev = require('gulp-rev');


gulp.task('scripts', function() {
    gulp.src('./app/scripts/*.js')

    .pipe(connect.reload());
});


gulp.task('html', function() {
    gulp.src('./app/views/*')
        .pipe(connect.reload());
});

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
        .pipe(gulp.dest('./app/styles'))
        .pipe(connect.reload());
    gutil.log('stuff happened', 'Really it did', gutil.colors.cyan('123'));
});

gulp.task('webserver', function() {
    connect.server({
        root: 'app',
        port: 8000,
        livereload: true
    });
});

gulp.task('clean', ['clearcache'], function() {
    return gulp.src('./www', {
            read: false
        })
        .pipe(clean());
});

gulp.task('clearcache', function (done) {
  return cache.clearAll(done);
});

gulp.task('bower', function() {
    gulp.src('./app/index.html')
        .pipe(wiredep({}))
        .pipe(gulp.dest('./app'));
    return gulp.src('./app/styles/main.scss')
        .pipe(wiredep({}))
        .pipe(gulp.dest('./app/styles/'));
});



/* ********** NEW BUILDSCRIPT ***** */


gulp.task('init', ['bower', 'clean'], function() {
    return true;
});

// Images
gulp.task('images', ['init'], function() {


    gulp.src(['./app/bower_components/mapbox.js/images/**'])
        .pipe(gulp.dest('./www/styles/images'));
    gulp.src(['./app/bower_components/chap-links-timeline/img/**'])
        .pipe(gulp.dest('./www/styles/img'));

    return gulp.src('./app/images/**/*')
        .pipe(cache(imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest('./www/images'));
});

// Images
gulp.task('copy', ['init'], function() {

    gulp.src(['./app/redirect.html', 'app/config.xml', 'app/config.json'])
        .pipe(gulp.dest('./www'));

    gulp.src('./app/views/**')
        .pipe(usemin())
        .pipe(gulp.dest('./www/views/'));

    gulp.src(['./app/vendor/**/*'])
        .pipe(gulp.dest('./www/vendor/'));

    gulp.src('./app/index.html')
        .pipe(usemin({
            css: [minifyCss(), rev()],
            html: [minifyHtml({
                empty: true
            })],
            js: [rev()]
        }))
        .pipe(gulp.dest('./www/'));

    return gulp.src(['./app/bower_components/**/fonts/**'])
        .pipe(flatten())
        .pipe(gulp.dest('./www/fonts/'));
});

gulp.task('build', [
    'init',
    'copy',
    'images'
], function() {

});


gulp.task('watch', function() {
    gutil.log(gutil.colors.green('Watcher started for ./app/styles/**/*.scss'));
    gulp.watch('./app/styles/**/*.scss', ['compass']);
    gulp.watch('./app/scripts/**/*.js', ['scripts']);
    gulp.watch('./app/views/*', ['html']);
});


gulp.task('default', ['clean', 'bower', 'compass', 'webserver', 'watch']);