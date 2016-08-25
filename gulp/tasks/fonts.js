'use strict';

var config = require('../config'),
    $ = require('gulp-load-plugins')(config.gulpLoadPlugins),
    gulp = require('gulp');

module.exports = function (options) {
    return function () {
        return $.multipipe(
            gulp.src(options.src),
            // checking all error in the stream
            $.plumber({
                errorHandler: $.notify.onError(function (err) {
                    return {
                        title: options.taskName,
                        message: 'file: ' + err.relativePath + '\rline: ' + err.line + '\r' + err.message
                    }
                })
            }),
            $.newer(options.dest),
            gulp.dest(options.dest)
        );
    };
};