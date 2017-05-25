var gulp = require("gulp"),
    express = require("gulp-express"),
    nodemon = require("gulp-nodemon"),
    open = require("gulp-open"),
    variables = require("./variables");

gulp.task("server", function () {
    express.run([variables.basePaths.server.path]);
});

gulp.task("gulp-coverage", function () {W
    gulp.src(variables.basePaths.coverage.path)
        .pipe(open());
});

gulp.task('nodemon', ["build"], function (cb) {
    var started = false;

    return nodemon({
        script: variables.basePaths.server.path
    }).on('start', function () {
        // to avoid nodemon being started multiple times
        // thanks @matthisk
        if (!started) {
            cb();
            started = true;
        }
    });
});