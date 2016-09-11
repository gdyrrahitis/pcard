var gulp = require("gulp"),
    sass = require("gulp-sass"),
    uglify = require("gulp-uglify"),
    merge = require("merge-stream"),
    browserSync = require("browser-sync"),
    reload = browserSync.reload;

// Css tasks
gulp.task("css:min", function () {
    gulp.src("dist/css/**/*.css")
        .pipe(uglify())
        .pipe(gulp.dest("."));
});

gulp.task("css", ["css:uglify"]);

// SASS tasks
gulp.task("sass", ["fonts"], function () {
    var custom = gulp.src("src/**/*.scss")
        .pipe(sass())
        .pipe(gulp.dest("dist/css"))
        .pipe(reload({
            stream: true
        }));

    var customFontAwesome = gulp.src("src/styles/custom-font-awesome.scss")
        .pipe(sass())
        .pipe(gulp.dest("dist/css/libs"))
        .pipe(reload({
            stream: true
        }));

    var bootstrap = gulp.src('src/styles/bootstrap.scss')
        .pipe(sass({
            outputStyle: 'nested',
            precison: 3,
            errLogToConsole: true,
            includePaths: ['./node_modules/bootstrap-sass/' + 'assets/stylesheets']
        }))
        .pipe(gulp.dest("dist/css/libs"));

    var fontAwesome = gulp.src("./node_modules/font-awesome/scss/font-awesome.scss")
        .pipe(sass())
        .pipe(gulp.dest("dist/css/libs"));


    return merge(custom, customFontAwesome, bootstrap, fontAwesome);
});