'use strict';

var config = require('../config'),
    $ = require('gulp-load-plugins')(config.gulpLoadPlugins),
    paths = require('../paths'),
    gulp = require('gulp');

module.exports = function (options) {
    return function () {
        return $.multipipe(
            gulp.src($.mainBowerFiles('**')),

            // checking all error in the stream
            $.plumber({
                errorHandler: $.notify.onError(function (err) {
                    return {
                        title: options.taskName,
                        message: err.message
                    }
                })
            }), // checking all error in the stream
            $.if(['*.css'], gulp.dest(options.cssDest)),
            $.if(['*.scss'], gulp.dest(options.scssDest)),
            $.if(['*.js'], gulp.dest(options.scriptsDest))
        );
    };
};
