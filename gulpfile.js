(function () {
    var gulp = require("gulp"),
        sass = require("gulp-sass"),
        express = require("gulp-express"),
        concat = require("gulp-concat"),
        uglify = require("gulp-uglify"),
        merge = require("merge-stream"),
        sequence = require("run-sequence"),
        del = require("del"),
        nodemon = require("gulp-nodemon"),
        browserSync = require("browser-sync"),
        reload = browserSync.reload;

    // JavaScript tasks
    gulp.task("js:copy", function () {
        gulp.src("node_modules/systemjs/dist/system.src.js")
            .pipe(gulp.dest("dist/js/libs"));
    });

    gulp.task("js", ["js:copy"]);

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
    gulp.task("watch", ["build"], function () {
        gulp.watch("src/**/*.scss", ["sass"]);
        gulp.watch("src/**/*.html", reload);
        gulp.watch("src/**/*.js", reload);
        gulp.watch("index.html", reload);
    });

    // Browsersync
    gulp.task("browser:sync", ["nodemon"], function () {
        browserSync.init(null, {
            proxy: "http://localhost:54879"
        })
    });

    // Build
    gulp.task("build", ["sass", "js", "fonts"]);
    gulp.task("build:w", function (callback) {
        sequence("clean", ["browser:sync", "watch"], callback);
    });

    // Start server
    // gulp.task("server", ["build:w"], function () {
    //     express.run(["server.js"], { cwd: undefined }, false);
    // });

    gulp.task("server", function () {
        express.run(["server.js"]);
    });


    gulp.task('nodemon', function (cb) {
        var started = false;

        return nodemon({
            script: 'server.js'
        }).on('start', function () {
            // to avoid nodemon being started multiple times
            // thanks @matthisk
            if (!started) {
                cb();
                started = true;
            }
        });
    });
})();