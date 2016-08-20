(function () {
    var gulp = require("gulp"),
        sass = require("gulp-sass"),
        merge = require("merge-stream"),
        del = require("del"),
        browserSync = require("browser-sync"),
        reload = browserSync.reload;

    // JavaScript tasks

    // Css tasks

    // SASS tasks
    gulp.task("sass", ["fonts"], function () {
        var custom = gulp.src("src/**/*.scss")
            .pipe(sass())
            .pipe(gulp.dest("dist/css"))
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

        return merge(custom, bootstrap, fontAwesome);
    });

    // Fonts
    gulp.task("fonts", function () {
        var bootstrap = gulp.src("node_modules/bootstrap-sass/assets/fonts/bootstrap/*.*")
            .pipe(gulp.dest("dist/css/fonts/bootstrap"));

        var fontAwesome = gulp.src("node_modules/font-awesome/fonts/*.*")
            .pipe(gulp.dest("dist/css/fonts"));

        return merge(bootstrap, fontAwesome);
    });

    // Clean
    gulp.task("clean", function () {
        return del("dist/**");
    });

    // Watching
    gulp.task("watch", ["sass"], function () {
        gulp.watch("src/**/*.scss", ["sass"]);
    });

    // Browsersync
    gulp.task("browser:sync", function () {
        browserSync.init(null, {
            proxy: "http://localhost:54879"
        })
    });

    // Build
    gulp.task("build", ["sass"]);
    gulp.task("build:w", ["browser:sync", "watch"]);
})();