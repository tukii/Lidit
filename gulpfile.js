
'use strict';

var gulp = require('gulp');
var browserSync = require('browser-sync');
var nodemon = require('gulp-nodemon');


gulp.task('default', ['browser-sync'], function () {
});
gulp.task('browser-sync',['nodemon'], function() {
	browserSync.init(null, {
		proxy: "http://localhost:8000",
        files: ["public/style/*.*","public/views/*.*","public/app/*.js"],
        browser: "mozilla firefox",
        port: 8002,
	});
});
gulp.task('nodemon', function (cb) {
	var started = false;
	return nodemon({
		script: 'app.js'
	}).on('start', function () {
		if (!started) {
			cb();
			started = true; 
		}
	});
});