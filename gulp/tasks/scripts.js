'use strict';

var config = require('../config'),
    $ = require('gulp-load-plugins')(config.gulpLoadPlugins),
    gulp = require('gulp');


var Scripts = (function () {

    function Scripts(options) {
        this.options = options;
        return this.init();
    }

    Scripts.prototype.init = function () {
        return this[this.options.type].bind(this);
    };

    // vendor tasks
    Scripts.prototype.vendor = function () {
        return $.multipipe(
            gulp.src(this.options.src),
            $.plumber({
                errorHandler: $.notify.onError(function (err) {
                    return {
                        title: options.taskName,
                        message: err.message
                    }
                })
            }),// checking all error in the stream
            $.concatUtil('plugins.js'),// concat files
            $.if(!config.isDevelopment, $.uglify()),// minify files
            gulp.dest(this.options.dest)
        );
    };

    // local tasks
    Scripts.prototype.local = function () {
        return $.multipipe(
            gulp.src(this.options.src),
            $.plumber({
                errorHandler: $.notify.onError(function (err) {
                    return {
                        title: options.taskName,
                        message: err.message
                    }
                })
            }), // checking all error in the stream

            $.include(),
                /*$.concatUtil('main.js'), // concat files
                $.concatUtil.header(';(function ($) { \n"use strict"; \n'),
                $.concatUtil.footer(' \n })(jQuery);'),*/
            $.if(!config.isDevelopment, $.uglify()),// minify files
            gulp.dest(this.options.dest)
        );
    };

    return Scripts;
})();


module.exports = function (options) {
    return new Scripts(options);
};