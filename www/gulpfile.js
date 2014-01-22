var gulp = require('gulp');
var gutil = require('gulp-util');
var concat = require('gulp-concat');
var watch = require('gulp-watch');
var less = require('gulp-less');
var path = require('path');

gulp.task('default', function(){
	watch({ glob: 'js/**/*.js' }, function(){
		console.log('JS File changed');
		gulp.run('scripts');
	});

	watch({ glob: 'less/**/*.less' }, function(){
		console.log('LESS File changed');
		gulp.run('css');
	});
});

gulp.task('scripts', function(){
  	gulp.src('./js/*.js')
    	.pipe(concat("scripts.js"))
    	.pipe(gulp.dest('./dist/'));

  	gulp.src('./js/controller/*.js')
    	.pipe(concat("controller.js"))
    	.pipe(gulp.dest('./dist/'));

  	gulp.src('./js/directive/*.js')
    	.pipe(concat("directives.js"))
    	.pipe(gulp.dest('./dist/'));

  	gulp.src(['./dist/scripts.js', './dist/controller.js', './dist/directives.js' ])
    	.pipe(concat("ppnet.js"))
    	.pipe(gulp.dest('./dist/'));
});

gulp.task('css', function(){
	gulp.src('less/app.less')
		.pipe(less({
			paths: [ path.join(__dirname, 'less', 'includes') ]
		}))
		.pipe(gulp.dest('./css'));
})