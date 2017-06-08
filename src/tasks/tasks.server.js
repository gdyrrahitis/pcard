var gulp = require("gulp"),
    express = require("gulp-express"),
    nodemon = require("gulp-nodemon"),
    sequence = require("run-sequence"),
    open = require("gulp-open"),
    browserSync = require("./browser.sync.js"),
    variables = require("./variables");

gulp.task("server", function () {
    express.run([variables.basePaths.server.path]);
});

gulp.task("gulp-coverage", function () {
    gulp.src(variables.basePaths.coverage.path).pipe(open());
});

gulp.task("nodemon", ["build"], function (cb) {
    var started = false;

    return nodemon({
        script: variables.basePaths.server.path,
        env: {
            "NODE_ENV": "development"
        }
    }).on("start", function () {
        if (!started) {
            cb();
            started = true;
        }
    });
});

gulp.task("nodemon:w", function (cb) {
    var started = false;

    return nodemon({
        script: variables.basePaths.server.path,
        env: {
            "NODE_ENV": "development"
        }
    }).on("start", function () {
        if (!started) {
            cb();
            started = true;
        }
    });
});

gulp.task("app:dev", function (done) {
    sequence("build:w", ["nodemon:w"], done);
});

gulp.task("app:prod", ["build:prod"]);