var gulp = require("gulp"),
    sequence = require("run-sequence");

gulp.task("build", function (callback) {
    sequence("clean", "ts", "bundle", callback);
});

gulp.task("build:w", function (callback) {
    sequence("build", ["watch"], callback);
});