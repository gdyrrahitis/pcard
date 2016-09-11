var gulp = require("gulp"),
    browserSync = require("browser-sync"),
    reload = browserSync.reload;

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