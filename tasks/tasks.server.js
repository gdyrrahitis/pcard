var gulp = require("gulp"),
    express = require("gulp-express"),
    nodemon = require("gulp-nodemon"),
    variables = require("./variables");

gulp.task("server", function () {
    express.run([variables.basePaths.server.path]);
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