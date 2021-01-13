const gulp = require('gulp');
const { src, dest } = require('gulp');
const minifyCss = require('gulp-minify-css');
const sass = require("gulp-sass");
const del = require('del');
const buffer = require('vinyl-buffer');
const uglify = require('gulp-uglify');
const gutil = require('gulp-util');
const size = require('gulp-size');
const autoprefixer = require('gulp-autoprefixer');
// const watch = require('gulp-watch');
const concat = require('gulp-concat');

const config = {
    autoprefixer: {
        cascade: false,
    },
    browserify: {
        name: 'bundle.js',
        dest: 'dist/js',
        options: {
          debug: false,
          entries: 'src/js/main.js',
        },
        error: function(err) {
          gutil.log(gutil.colors.red('Browserify error:') + ' ' + err.message);
          this.emit('end');
        },
    },
    size: {
        showFiles: true,
    }
}

const paths = {
    css: {
        src: "src/scss/**/*.scss",
        dest: "dist/css/"
    },
    js: {
        src: "src/js/**/*.js",
        dest: "dist/js/"
    }
}

function js() {
    return src(paths.js.src)
    .pipe(concat('bundle.js'))
    .pipe(buffer())
    .pipe(uglify().on('error', function(err) {
        gutil.log(gutil.colors.red('[Error]'), err.toString());
        this.emit('end');
      }))
    .pipe(size(config.size))
    .pipe(dest(paths.js.dest))
}

function css() {
    return src(paths.css.src)
    .pipe(sass())
    .on("error", sass.logError)
    .pipe(autoprefixer(config.autoprefixer))
    .pipe(minifyCss())
    .pipe(dest(paths.css.dest))
}

function clean() {
    return del([
        paths.css.dest,
    ]);
}

function watchFiles() {
    gulp.watch(paths.css.src, css);
    gulp.watch(paths.js.src, js);
}

const watch = gulp.parallel(watchFiles);
exports.watch = watch;
// gulp.task('watch', () => {
//     gulp.watch(paths.css.src, (done) => {
//         gulp.series(['clean', 'css'])(done);
//     });

//     // gulp.watch(paths.js.src, (done) => {
//     //     gulp.series(['clean', 'js'])(done);
//     // });
// });


