var gulp = require("gulp"),
    variables = require("./variables");

// JavaScript tasks
gulp.task("js:copy", function () {
    gulp.src(variables.libPaths.src.systemJs)
        .pipe(gulp.dest(variables.libPaths.dest.js));
});

gulp.task("js", ["js:copy"]);