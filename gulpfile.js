'use strict';

var gulp = require('gulp'),
    config = require('./gulp/config'),
    $ = require('gulp-load-plugins')(config.gulpLoadPlugins);
console.log($);
// paths
var paths = require('./gulp/paths');


// require task
function lazyRequireTask(taskName, options) {
    options = options || {};
    options.taskName = taskName;

    if (!options.path) {
        options.path = config.tasksPath + taskName;
    }

    gulp.task(taskName, function (callback) {
        var task = require(options.path).call(this, options);

        return task(callback);
    });
}

// remove dest directory
lazyRequireTask('clean', {
    src: paths.dest
});

// jade task
lazyRequireTask('jade', {
    src: paths.template.pages,
    dest: paths.template.dest
});

// styles task
lazyRequireTask('styles', {
    src: paths.styles.scss.main,
    dest: paths.styles.dest
});

// images task
lazyRequireTask('images', {
    src: paths.images.all,
    dest: paths.images.dest
});

// fonts task
lazyRequireTask('fonts', {
    src: paths.fonts.all,
    dest: paths.fonts.dest
});

// scripts vendor task
lazyRequireTask('scripts:vendor', {
    src: paths.scripts.vendor.all,
    dest: paths.scripts.dest,
    type: 'vendor',
    path: config.tasksPath + '/scripts'
});

// scripts local task
lazyRequireTask('scripts:local', {
    src: paths.scripts.local.main,
    dest: paths.scripts.dest,
    type: 'local',
    path: config.tasksPath + '/scripts'
});

// bower files task
lazyRequireTask('bower-files', {
    cssDest: paths.styles.css.path,
    scssDest: paths.styles.scss.path,
    scriptsDest: paths.scripts.vendor.path,
    dest: paths.src
});

// server task
lazyRequireTask('server', {
    dest: paths.dest
});

// gulp watch
gulp.task('watch', function () {

    /*$.watch(paths.template.all, function () {
     gulp.start('jade');
     });*/
    gulp.watch(paths.template.all, ['jade']);
    gulp.watch(paths.styles.scss.all, ['styles']);
    gulp.watch(paths.scripts.local.all, ['scripts:local']);
    gulp.watch(paths.scripts.vendor.all, ['scripts:vendor']);
    gulp.watch(paths.images.all, ['images']);
    gulp.watch(paths.fonts.all, ['fonts']);
});

gulp.task('development', function () {
    return $.runSequence(['watch', 'server']);
});

gulp.task('build', function () {
    config.isDevelopment = false;
    return $.runSequence(['clean'], ['jade', 'styles', 'images', 'fonts', 'scripts:local', 'scripts:vendor']);
});

gulp.task('default', function () {
    return $.runSequence(['clean'], ['jade', 'styles', 'images', 'scripts:local', 'scripts:vendor'], ['watch', 'server']);
});


