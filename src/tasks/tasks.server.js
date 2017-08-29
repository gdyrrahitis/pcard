var gulp = require("gulp"),
    express = require("gulp-express"),
    nodemon = require("gulp-nodemon"),
    sequence = require("run-sequence"),
    open = require("gulp-open"),
    browserSync = require("./browser.sync.js"),
    path = require("path"),
    gutil = require("gulp-util"),
    args = require("yargs").argv;

var prod = args.prod,
    app = "app.js",
    coverage = path.resolve(__dirname, "../../") + "/coverage/html/index.html";

gulp.task("server", function () {
    express.run([app]);
});

gulp.task("gulp-coverage", function () {
    gulp.src(coverage).pipe(open());
});

gulp.task("nodemon", ["build"], function (done) {
    var started = false;

    return nodemon({
        script: app,
        env: {
            "NODE_ENV": "development"
        }
    }).on("start", function () {
        if (!started) {
            done();
            started = true;
        }
    });
});

gulp.task("app", function (done) {
    gutil.log(gutil.colors.green("Building on " + (prod ? "PROD" : "DEV")));
    
    if (prod) {
        sequence("build", done);
    } else {
        sequence("build:w", ["server"], done);
    }
});