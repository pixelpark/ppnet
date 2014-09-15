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
    minifycss = require('gulp-minify-css'),
    imagemin = require('gulp-imagemin'),
    concat = require('gulp-concat'),
    //notify = require('gulp-notify'),
    cache = require('gulp-cache'),
    rename = require('gulp-rename'),
    jshint = require('gulp-jshint');



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
    gulp.src('./app/styles/main.scss')
        .pipe(wiredep({}))
        .pipe(gulp.dest('./app/styles/'));
});



// Styles
gulp.task('build_styles', function() {
    return gulp.src('./app/styles/main.scss')
        .pipe(compass({
            config_file: './config.rb',
            css: 'styles',
            sass: 'styles',
            image: 'app/images'
        }))
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .pipe(gulp.dest('./www/styles'))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(minifycss())
        .pipe(gulp.dest('./www/styles'));
});

// Scripts
gulp.task('build_scripts', function() {
    return gulp.src('./app/scripts/**/*.js')
        .pipe(jshint('.jshintrc'))
        .pipe(jshint.reporter('default'))
        .pipe(concat('main.js'))
        .pipe(gulp.dest('./www/scripts'))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(uglify())
        .pipe(gulp.dest('./www/scripts'));
});

// Images
gulp.task('build_images', function() {
    return gulp.src('./app/images/**/*')
        .pipe(cache(imagemin({
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
        })))
        .pipe(gulp.dest('./www/images'));
});

gulp.task('build', ['clean', 'bower', 'build_styles', 'build_scripts', 'build_images']);

gulp.task('build_old', function() {
    gulp.src('./app/index.html')
        .pipe(usemin())
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
    gulp.watch('./app/scripts/**/*.js', ['scripts']);
    gulp.watch('./app/views/*', ['html']);
});


gulp.task('default', ['clean', 'bower', 'compass', 'webserver', 'watch']);