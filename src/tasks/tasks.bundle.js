var gulp = require("gulp"),
    gutil = require("gulp-util"),
    browserSync = require("./browser.sync.js"),
    browserify = require("browserify"),
    tsify = require("tsify"),
    babelify = require("babelify"),
    source = require("vinyl-source-stream"),
    buffer = require("vinyl-buffer"),
    uglify = require("gulp-uglify");

var entry = browserify("src/app/client/app.module.ts");

function bundle(bundler) {
    return bundler
        .plugin(tsify)
        .transform(babelify, { presets: ["es2015"], extensions: ['.tsx', '.ts'] })
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
    bundle(browserify("src/app/client/app.module.ts"))
        .pipe(buffer())
        .pipe(uglify())
        .on("error", function (e) {
            gutil.log(gutil.colors.bgRed(e));
        })
        .pipe(gulp.dest("dist/"));
});

module.exports.bundle = bundle;
module.exports.bundleWithBrowserSync = bundleWithBrowserSync;