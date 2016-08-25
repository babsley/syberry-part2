var srcDir = './app',
    destDir = './dist';

module.exports = {
    src: srcDir,
    dest: destDir,
    template: {
        all: srcDir + '/templates/**/*.jade',
        pages: srcDir + '/templates/pages/**/*.jade',
        path: srcDir + '/templates/pages',
        dest: destDir
    },
    styles: {
        css: {
            all: srcDir + '/assets/styles/css/**/*.css',
            path: srcDir + '/assets/styles/css'
        },
        scss: {
            all: srcDir + '/assets/styles/**/*.scss',
            main: srcDir + '/assets/styles/scss/*main.scss',
            path: srcDir + '/assets/styles/scss'
        },
        dest: destDir + '/css'
    },
    fonts: {
        all: srcDir + '/assets/fonts/**/*.*',
        path: srcDir + '/assets/fonts',
        dest: destDir + '/fonts'
    },
    images: {
        all: srcDir + '/assets/images/**/*.*',
        path: srcDir + '/assets/images',
        dest: destDir + '/img'
    },
    scripts: {
        local: {
            all: srcDir + '/assets/scripts/local/**/*.js',
            main: srcDir + '/assets/scripts/local/**.js',
            path: srcDir + '/assets/scripts/local'
        },
        vendor: {
            all: srcDir + '/assets/scripts/vendor/**/*.js',
            path: srcDir + '/assets/scripts/vendor'
        },
        dest: destDir + '/js'
    }
};
