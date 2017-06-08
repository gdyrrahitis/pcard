var gulp = require("gulp"),
    sass = require("gulp-sass"),
    uglify = require('gulp-uglifycss'),
    merge = require("merge-stream"),
    browserSync = require("./browser.sync.js"),
    reload = browserSync.reload,
    variables = require("./variables");

// CSS tasks
gulp.task("css:minify", function () {
    gulp.src(variables.libPaths.dest.allCss)
        .pipe(uglify({
            "uglyComments": false
        }))
        .pipe(gulp.dest("./dist/css/libs/"));
});

gulp.task("css", ["css:minify"]);

// SASS tasks
gulp.task("sass", ["fonts"], function () {
    var custom = gulp.src(variables.libPaths.src.allSassInSrc)
        .pipe(sass())
        .pipe(gulp.dest(variables.libPaths.dest.css))
    // .pipe(reload({
    //     stream: true
    // }));

    var customFontAwesome = gulp.src(variables.libPaths.src.customFontAwesome)
        .pipe(sass())
        .pipe(gulp.dest(variables.libPaths.dest.css))
    // .pipe(reload({
    //     stream: true
    // }));

    var bootstrap = gulp.src(variables.libPaths.src.bootstrap)
        .pipe(sass({
            outputStyle: "nested",
            precison: 3,
            errLogToConsole: true,
            includePaths: [variables.libPaths.src.bootstrapSass]
        }))
        .pipe(gulp.dest(variables.libPaths.dest.css));

    var fontAwesome = gulp.src(variables.libPaths.src.fontAwesome)
        .pipe(sass())
        .pipe(gulp.dest(variables.libPaths.dest.css));

    var toastr = gulp.src(variables.libPaths.src.toastrSass)
        .pipe(sass())
        .pipe(gulp.dest(variables.libPaths.dest.css));

    return merge(custom, customFontAwesome, bootstrap, fontAwesome, toastr);
});

gulp.task("sass:prod", ["fonts"], function () {
    var custom = gulp.src(variables.libPaths.src.allSassInSrc)
        .pipe(sass())
        .pipe(gulp.dest(variables.libPaths.dest.css));

    var customFontAwesome = gulp.src(variables.libPaths.src.customFontAwesome)
        .pipe(sass())
        .pipe(gulp.dest(variables.libPaths.dest.css));

    var bootstrap = gulp.src(variables.libPaths.src.bootstrap)
        .pipe(sass({
            outputStyle: "nested",
            precison: 3,
            errLogToConsole: true,
            includePaths: [variables.libPaths.src.bootstrapSass]
        }))
        .pipe(gulp.dest(variables.libPaths.dest.css));

    var fontAwesome = gulp.src(variables.libPaths.src.fontAwesome)
        .pipe(sass())
        .pipe(gulp.dest(variables.libPaths.dest.css));

    var toastr = gulp.src(variables.libPaths.src.toastrSass)
        .pipe(sass())
        .pipe(gulp.dest(variables.libPaths.dest.css));

    return merge(custom, customFontAwesome, bootstrap, fontAwesome, toastr);
});