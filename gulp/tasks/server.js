'use strict';

var config = require('../config'),
    $ = require('gulp-load-plugins')(config.gulpLoadPlugins),
    gulp = require('gulp');

module.exports = function (options, callback) {
    return function () {
        $.browserSync.init({
            server: options.dest
        });
        $.browserSync.watch(options.dest + '/**/*.*').on('change', $.browserSync.reload);
    };
};
