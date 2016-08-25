'use strict';

var config = require('../config'),
    $ = require('gulp-load-plugins')(config.gulpLoadPlugins),
    gulp = require('gulp');
module.exports = function (options) {
    return function () {
        return $.del(options.src);
    }
};