var gulp = require("gulp"),
    sequence = require("run-sequence");

gulp.task("build", function (callback) {
    sequence("clean", "ts", ["sass", "fonts"], "bundle", "css", callback);
});

gulp.task("build:w", function (callback) {
    sequence("build", ["watch"], callback);
});