var gulp = require("gulp"),
    sass = require("gulp-sass"),
    uglify = require("gulp-cssnano"),
    concat = require("gulp-concat"),
    sourcemaps = require("gulp-sourcemaps"),
    merge = require("merge-stream"),
    sequence = require("run-sequence"),
    gutil = require("gulp-util"),
    browserSync = require("./browser.sync.js"),
    reload = browserSync.reload,
    variables = require("./variables");

gulp.task("css:bundle", function () {
    gulp.src(variables.libPaths.dest.allCss)
        .pipe(concat("site.css"))
        .pipe(gulp.dest("./dist/css/libs/styles/"))
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest("./dist/css/libs/styles/"));
});


gulp.task("css:bundle:prod", function () {
    gulp.src(variables.libPaths.dest.allCss)
        .pipe(concat("site.css"))
        .pipe(gulp.dest("./dist/css/libs/styles/"))
        .pipe(uglify())
        .pipe(gulp.dest("./dist/css/libs/styles/"));
});

gulp.task("css", ["css:bundle"]);
gulp.task("css:prod", ["css:bundle:prod"]);

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