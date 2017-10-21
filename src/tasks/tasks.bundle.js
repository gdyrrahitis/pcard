var gulp = require("gulp"),
    gutil = require("gulp-util"),
    source = require("vinyl-source-stream"),
    buffer = require("vinyl-buffer"),
    noop = require("gulp-noop"),
    args = require("yargs").argv,
    main = require("./variables.js").main,
    webpackConfig = require("../../webpack.config.js"),
    webpackStream = require('webpack-stream'),
    webpack2 = require('webpack'),
    prod = args.prod;

gulp.task("bundle", function () {
    gutil.log(gutil.colors.green("Bunding on " + (prod ? "PROD" : "DEV")));
    return gulp.src(main)
        .pipe(webpackStream(webpackConfig).on("error", function (e) {
            gutil.log(gutil.colors.bgRed(e));
        }), webpack2)
        .pipe(gulp.dest("dist/"));
});