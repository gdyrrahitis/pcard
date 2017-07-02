var gulp = require("gulp"),
    gutil = require("gulp-util"),
    mocha = require("gulp-mocha"),
    sequence = require("run-sequence"),
    karma = require("karma").Server;

gulp.task("test:dev", ["ts"], function (callback) {
    gulp.watch("app.ts", ["ts"]);
    gulp.watch("src/app/**/*.ts", ["ts"]);

    new karma(require("../karma/karma.conf.dev")).start();
});

gulp.task("test:travis", ["ts"], function (callback) {
    if (process.env.TRAVIS) {
        new karma(require("../karma/karma.conf.travis")).
            on("error", function (error) {
                gutil.log(error);
                process.exit(1);
            }).start();
    }
    else {
        gutil.log(gutil.colors.bgRed("Fatal error. CI tests will run only in TRAVIS environment"));
    }
});

var mochaRun = function () {
    return gulp.src("src/app/server/tests/**/*.js", { read: false })
        .pipe(mocha({ timeout: 10000, reporter: "list" }))
        .on("error", gutil.log);
};

gulp.task("mocha", function () {
    return mochaRun();
});

gulp.task("mocha:dev", ["ts"], function (callback) {
    gulp.watch("src/app/server/**/*.ts", function () {
        sequence("ts", "mocha");
    });
    mochaRun();
});

gulp.task("mocha:travis", ["ts"], function (callback) {
    if (process.env.TRAVIS) {
        return mochaRun();
    }
    else {
        gutil.log(gutil.colors.bgRed("Fatal error. CI tests will run only in TRAVIS environment"));
    }
});

