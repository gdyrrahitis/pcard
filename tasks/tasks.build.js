var gulp = require("gulp"),
    express = require("gulp-express"),
    sequence = require("run-sequence"),
    nodemon = require("gulp-nodemon");

// Build
gulp.task("build", function (callback) {
    sequence("clean", ["sass", "js", "fonts"], callback);
});

gulp.task("build:w", function (callback) {
    sequence("clean", ["browser:sync", "watch"], callback);
});