var gulp = require("gulp");

// JavaScript tasks
gulp.task("js:copy", function () {
    gulp.src("node_modules/systemjs/dist/system.src.js")
        .pipe(gulp.dest("dist/js/libs"));
});

gulp.task("js", ["js:copy"]);