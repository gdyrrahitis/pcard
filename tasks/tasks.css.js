var gulp = require("gulp"),
    sass = require("gulp-sass"),
    uglify = require("gulp-uglify"),
    merge = require("merge-stream"),
    browserSync = require("browser-sync"),
    reload = browserSync.reload,
    variables = require("./variables");

// Css tasks
gulp.task("css:min", function () {
    gulp.src(variables.libPaths.src.allCssInSrc)
        .pipe(uglify())
        .pipe(gulp.dest("."));
});

gulp.task("css", ["css:uglify"]);

// SASS tasks
gulp.task("sass", ["fonts"], function () {
    var custom = gulp.src(variables.libPaths.src.allSassInSrc)
        .pipe(sass())
        .pipe(gulp.dest(variables.libPaths.dest.css))
        .pipe(reload({
            stream: true
        }));

    var customFontAwesome = gulp.src(variables.libPaths.src.customFontAwesome)
        .pipe(sass())
        .pipe(gulp.dest(variables.libPaths.dest.css))
        .pipe(reload({
            stream: true
        }));

    var bootstrap = gulp.src(variables.libPaths.src.bootstrap)
        .pipe(sass({
            outputStyle: 'nested',
            precison: 3,
            errLogToConsole: true,
            includePaths: [variables.libPaths.src.bootstrapSass]
        }))
        .pipe(gulp.dest(variables.libPaths.dest.css));

    var fontAwesome = gulp.src(variables.libPaths.src.fontAwesome)
        .pipe(sass())
        .pipe(gulp.dest(variables.libPaths.dest.css));


    return merge(custom, customFontAwesome, bootstrap, fontAwesome);
});