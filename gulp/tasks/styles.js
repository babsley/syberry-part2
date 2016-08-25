'use strict';

var config = require('../config'),
    $ = require('gulp-load-plugins')(config.gulpLoadPlugins),
    gulp = require('gulp');


module.exports = function (options) {
    return function () {
        return $.multipipe(
            gulp.src(options.src),
            $.plumber({
                errorHandler: $.notify.onError(function (err) {
                    return {
                        title: options.taskName,
                        message: err.message
                    }
                })
            }), // checking all error in the stream
            $.if(config.isDevelopment, $.sourcemaps.init()),
            $.sass({outputStyle: 'expanded'}),
            $.autoprefixer(config.autoprefixer),
            //$.cached(options.taskName),
            //$.remember(options.taskName),
            $.if(!config.isDevelopment, $.cleanCss()),
            $.if(config.isDevelopment, $.sourcemaps.write()),
            gulp.dest(options.dest)
        );
    };
};
