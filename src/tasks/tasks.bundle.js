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
    args = require("yargs").argv;

var entry = browserify("src/app/client/app.module.ts");
var prod = args.prod;
gutil.log(gutil.colors.green("Bunding for " + (prod ? "PROD" : "DEV")));

function bundle(bundler) {
    return bundler
        .plugin(tsify)
        .transform(babelify, { presets: ["es2015"], extensions: ['.tsx', '.ts'] })
        .transform(stringify, { appliesTo: { includeExtensions: [".html"] }, minify: true })
        .bundle()
        .pipe(source("src/app/client/app.module.js"));
}

function bundleWithBrowserSync(bundler) {
    return bundle(bundler)
        .on("error", function (e) {
            gutil.log(gutil.colors.bgRed(e));
        })
        .pipe(gulp.dest("dist/"))
        .pipe(browserSync.stream());
}

gulp.task("bundle", function () {
    bundleWithBrowserSync(entry);
});

gulp.task("bundle:prod", function () {
    bundle(entry)
        .pipe(buffer())
        .pipe(!prod ? sourcemaps.init() : noop())
        .pipe(prod ? uglify() : noop())
        .on("error", function (e) {
            gutil.log(gutil.colors.bgRed(e));
        })
        .pipe(!prod ? sourcemaps.write() : noop())
        .pipe(gulp.dest("dist/"))
        .pipe(!prod ? browserSync.stream() : noop());
});

module.exports.bundle = bundle;
module.exports.bundleWithBrowserSync = bundleWithBrowserSync;