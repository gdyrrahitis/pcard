var gulp = require("gulp"),
    merge = require("merge-stream"),
    variables = require("./variables");

// Fonts
gulp.task("fonts", function () {
    var bootstrap = gulp.src(variables.libPaths.src.bootstrapFonts)
        .pipe(gulp.dest(variables.libPaths.dest.fontsBootstrap));

    var fontAwesome = gulp.src(variables.libPaths.src.fontAwesomeFonts)
        .pipe(gulp.dest(variables.libPaths.dest.fonts));

    return merge(bootstrap, fontAwesome);
});