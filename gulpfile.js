'use strict'

// Variables
//----------
var sources = './sources/';
var output = './output/';
//-----
var gulp = require('gulp');
var sass = require('gulp-sass');
sass.compiler = require('node-sass');
var rename = require("gulp-rename");
var browserSync = require('browser-sync').create();
var uglify = require('gulp-uglify');
var pipeline = require('readable-stream').pipeline;
const autoprefixer = require('gulp-autoprefixer');

// Plugins tasks
//--------------
gulp.task('sass-work', function () {
	return gulp.src(sources + 'css/sass/**/*.scss')
		.pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
		.pipe(autoprefixer({ cascade: false }))
		.pipe(rename({extname: ".min.css"}))
		.pipe(gulp.dest(output + 'css/'));
});
gulp.task('js-work', function JS_compressor() {
	return pipeline(
		gulp.src(sources + 'script/*.js'),
		//uglify(),
		rename({ extname: ".min.js" }),
		gulp.dest(output + 'script/')
	);
});
gulp.task('html-work', function () {
	return gulp.src(sources + '*.html')
		.pipe(gulp.dest(output));
});
gulp.task('img-work', function () {
	return gulp.src(sources + 'img/*.*')
		.pipe(gulp.dest(output + 'img/'));
});
gulp.task('browser-sync', function () {
	browserSync.init({
		server: {
			baseDir: output
		}
	});
});
exports.default = () => (
	gulp.src(output + 'css/*.css')
		.pipe(autoprefixer({
			cascade: false
		}))
		.pipe(gulp.dest(output))
);

// Gulp launcher task
//-------------------
gulp.task('modifications-checker', gulp.series(
	'js-work',			// Pre-feed the output before initializing browser-sync
	'sass-work',		//
	'img-work',			//
	'html-work',		//
	gulp.parallel(
		'browser-sync',
		function sources_checker() {
			gulp.watch(sources + 'script/*.js', gulp.series('js-work'));
			gulp.watch(sources + 'css/**/*.scss', gulp.series('sass-work'));
			gulp.watch(sources + '*.html', gulp.series('html-work'));
			gulp.watch(sources + 'img/*.*', gulp.series('img-work'));
		},
		function browser_reloader() {
			gulp.watch(output + '**/*.*').on('change', browserSync.reload);
		}
	)
));
