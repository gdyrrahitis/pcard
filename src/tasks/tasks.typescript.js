var gulp = require("gulp"),
    ts = require("gulp-typescript"),
    tslint = require("gulp-tslint");

var project = ts.createProject("./tsconfig.json");

gulp.task("ts", function () {
    return project
        .src()
        .pipe(tslint({
            formatter: "stylish"
        }))
        .pipe(tslint.report({
            summarizeFailureOutput: true
        }))
        .pipe(project())
        .js
        .pipe(gulp.dest(function (file) {
            return file.base;
        }));
});