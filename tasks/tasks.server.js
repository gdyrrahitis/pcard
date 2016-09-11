var gulp = require("gulp"),
    express = require("gulp-express"),
    nodemon = require("gulp-nodemon");

gulp.task("server", function () {
    express.run(["server/server.js"]);
});

gulp.task('nodemon', ["build"], function (cb) {
    var started = false;

    return nodemon({
        script: 'server/server.js'
    }).on('start', function () {
        // to avoid nodemon being started multiple times
        // thanks @matthisk
        if (!started) {
            cb();
            started = true;
        }
    });
});