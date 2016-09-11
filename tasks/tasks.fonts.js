var gulp = require("gulp"),
    merge = require("merge-stream");

// Fonts
gulp.task("fonts", function () {
    var bootstrap = gulp.src("node_modules/bootstrap-sass/assets/fonts/bootstrap/*.*")
        .pipe(gulp.dest("dist/css/fonts/bootstrap"));

    var fontAwesome = gulp.src("node_modules/font-awesome/fonts/*.*")
        .pipe(gulp.dest("dist/css/fonts"));

    return merge(bootstrap, fontAwesome);
});