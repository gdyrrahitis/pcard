var gulp = require("gulp"),
    del = require("del");

// Clean
gulp.task("clean", function () {
    return del("dist/**");
});