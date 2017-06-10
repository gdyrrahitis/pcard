var gulp = require("gulp"),
    gutil = require("gulp-util"),
    browserSync = require("./browser.sync.js"),
    reload = browserSync.reload,
    browserify = require("browserify"),
    watchify = require("watchify");
bundleTasks = require("./tasks.bundle"),
    bundleWithBrowserSync = bundleTasks.bundleWithBrowserSync,
    bundle = bundleTasks.bundle,

    gulp.task("watch", function () {
        gulp.watch("src/client/**/*.scss", ["sass"], reload);
        gulp.watch("src/client/**/*.html", reload);
        gulp.watch("index.html", reload);
        gulp.watch("app.ts", ["ts"]);
        gulp.watch("src/server/**/*.ts", ["ts"]);
        gulp.watch("src/domain/**/*.ts", ["ts"]);
        gulp.watch("src/shared/**/*.ts", ["ts"]);

        var watcher = watchify(browserify("./src/client/main.ts", watchify.args));
        bundleWithBrowserSync(watcher);
        watcher.on("update", function () {
            bundleWithBrowserSync(watcher);
        });

        watcher.on("log", gutil.log);

        browserSync.init({
            port: 4000,
            ui: {
                port: 4011
            },
            reloadOnRestart: true,
            proxy: "localhost:8000",
            socket: {
                namespace: '/someothername'
            }
        });
    });