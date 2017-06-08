var gulp = require("gulp"),
    gutil = require("gulp-util"),
    karma = require("karma").Server;

gulp.task("test:dev", ["ts"], function (callback) {
    gulp.watch("app.ts", ["ts"]);
    gulp.watch("src/**/*.ts", ["ts"]);

    new karma(require("../../karma.conf.dev")).start();
});

gulp.task("test:travis", ["ts"], function (callback) {
    if (process.env.TRAVIS) {
        new karma(require("../../karma.conf.travis")).start();
    }
    else {
        gutil.log(gutil.colors.bgRed("Fatal error. CI tests will run only in TRAVIS environment"));
    }
});