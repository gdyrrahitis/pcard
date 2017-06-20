var gulp = require("gulp"),
    sequence = require("run-sequence");

gulp.task("build", function (callback) {
    sequence("clean", "ts", ["sass", "fonts"], "css", "bundle", callback);
});

gulp.task("build:w", function (callback) {
    sequence("build", ["watch"], callback);
});

gulp.task("build:prod", function (callback) {
    sequence("clean", "ts", ["sass:prod", "fonts"], "bundle:prod", "css:prod", callback);
});