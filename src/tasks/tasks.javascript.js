var gulp = require("gulp"),
    uglify = require("gulp-uglify"),
    variables = require("./variables");

gulp.task("js:copy", function () {
    gulp.src(variables.libPaths.src.systemJs)
        .pipe(gulp.dest(variables.libPaths.dest.js));
});

gulp.task("js", ["js:copy"]);