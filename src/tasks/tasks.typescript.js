var gulp = require("gulp"),
    ts = require("gulp-typescript");

var project = ts.createProject("./tsconfig.json");

gulp.task("ts", function () {
    return project
        .src()
        .pipe(project())
        .js
        .pipe(gulp.dest(function (file) {
            return file.base;
        }));
});