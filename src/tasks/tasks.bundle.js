// TODO: Use the gulp-load-plugins
var gulp = require("gulp"),
    gutil = require("gulp-util"),
    browserSync = require("./browser.sync.js"),
    browserify = require("browserify"),
    tsify = require("tsify"),
    babelify = require("babelify"),
    source = require("vinyl-source-stream"),
    buffer = require("vinyl-buffer"),
    stringify = require('stringify'),
    sourcemaps = require("gulp-sourcemaps"),
    noop = require("gulp-noop"),
    uglify = require("gulp-uglify"),
    args = require("yargs").argv,
    main = require("./variables.js").main;

var webpackConfig = require("../../webpack.config.js");
var webpackStream = require('webpack-stream');
var webpack2 = require('webpack');

var mainWithJsExt = main.replace(".ts", ".js");
var entry = browserify(main);
var prod = args.prod;

function browserifyConfig(bundler) {
    return bundler
        .plugin(tsify)
        .transform(babelify, { presets: ["es2015"], extensions: ['.tsx', '.ts'] })
        .transform(stringify, {
            appliesTo: { includeExtensions: ['.html'] }
        })
        .bundle()
        .pipe(source(mainWithJsExt));
}

function bundle() {
    return browserifyConfig(entry)
        .pipe(buffer())
        .pipe(!prod ? sourcemaps.init() : noop())
        .pipe(prod ? uglify() : noop())
        .on("error", function (e) {
            gutil.log(gutil.colors.bgRed(e));
        })
        .pipe(!prod ? sourcemaps.write() : noop())
        .pipe(gulp.dest("dist/"))
        .pipe(!prod ? browserSync.stream() : noop());
}

gulp.task("bundle", function () {
    gutil.log(gutil.colors.green("Bunding on " + (prod ? "PROD" : "DEV")));
    return gulp.src(main)
        .pipe(webpackStream(webpackConfig), webpack2)
        .pipe(gulp.dest("dist/"));
});

module.exports.bundle = bundle;