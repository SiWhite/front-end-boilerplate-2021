const browserify = require('browserify');
const gulp = require('gulp');
const { src, dest } = require('gulp');
const minifyCss = require('gulp-minify-css');
const sass = require("gulp-sass");
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const uglify = require('gulp-uglify');
const gutil = require('gulp-util');
const size = require('gulp-size');
const argv = require('yargs').argv;
const autoprefixer = require('gulp-autoprefixer');
const collapse = require('bundle-collapser/plugin');
const imagemin = require('gulp-imagemin');
const clean = require('gulp-clean');
const browserSync = require('browser-sync').create();

const paths = {
    css: {
        src: "src/scss/**/*.scss",
        dest: "dist/css/"
    },
    js: {
        src: "src/js/*.js",
        dest: "dist/js/"
    },
    html: {
        src: "src/*.html",
        dest: "dist/"
    },
    img: {
        src: "src/img/*",
        dest: "dist/img"
    }
}

const config = {
    autoprefixer: {
        cascade: false,
    },
    browserify: {
        name: 'bundle.js',
        dest: 'dist/js',
        options: {
          debug: false,
          entries: 'src/js/app.js',
        },
        error: function(err) {
          gutil.log(gutil.colors.red('Browserify error:') + ' ' + err.message);
          this.emit('end');
        },
    },
    compress: ! argv.u,
    sass: {
        error: function(err) {
            gutil.log(gutil.colors.red('Sass error:') + ' ' + err.message);
            this.emit('end');
        },
    },
    minifyCss: {
        keepBreaks: true,
        keepSpecialComments: false,
    },
    size: {
        showFiles: true,
    }
}

function js() {
    var bundler  = browserify(config.browserify.options);
    clearJs();
    return bundler.plugin(collapse).bundle()
    .on('error', config.browserify.error)
    .pipe(source(config.browserify.name))
    .pipe(buffer())
    .pipe(config.compress ? uglify().on('error', function(err) {
      gutil.log(gutil.colors.red('[Error]'), err.toString());
      this.emit('end');
    }) : gutil.noop())
    .pipe(size(config.size))
    .pipe(dest(config.browserify.dest, {allowEmpty: true}))
    .pipe(browserSync.stream());
}

function css() {
    clearCss();
    return src(paths.css.src)
    .pipe(sass()).on("error", config.sass.error)
    .pipe(autoprefixer(config.autoprefixer))
    .pipe(minifyCss(config.minifyCss))
    .pipe(size(config.size))
    .pipe(dest(paths.css.dest, {allowEmpty: true}))
    .pipe(browserSync.stream());
}

function copyhtml() {
    clearHtml();
    return src(paths.html.src)
    .pipe(dest(paths.html.dest, {allowEmpty: true}))
    .pipe(browserSync.stream());
}

function imgSquash() {
    return src(paths.img.src)
    .pipe(imagemin())
    .pipe(dest(paths.img.dest, {allowEmpty: true}))
}

function clearCss() {
    return src(paths.css.dest, {
            read: false
        })
        .pipe(clean());
}

function clearJs() {
    return src(paths.js.dest, {
            read: false
        })
        .pipe(clean());
}

function clearHtml() {
    return src(paths.html.dest+'/*.html', {
            read: false
        })
        .pipe(clean());
}



function watch() {
    gulp.watch(paths.html.src, copyhtml);
    gulp.watch(paths.css.src, css);
    gulp.watch(paths.js.src, js);
    gulp.watch(paths.img.src, imgSquash);
    browserSync.init({
        server: {
           baseDir: "./dist",
           index: "/index.html"
        }
    });
}



gulp.task('build', gulp.parallel(css, js));

exports.watch = watch;


