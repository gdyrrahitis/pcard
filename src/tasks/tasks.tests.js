var gulp = require("gulp"),
    gutil = require("gulp-util"),
    mocha = require("gulp-mocha"),
    sequence = require("run-sequence"),
    path = require("path"),
    karma = require("karma").Server,
    args = require("yargs").argv;

var travis = args.travis,
    configFile = path.resolve(__dirname, "../../") + "/karma.conf.js",
    devConfig = {
        configFile: configFile,
        singleRun: false,
        autoWatch: true,
        logLevel: "INFO",
        browsers: ["ChromeHeadless"],
    },
    travisConfig = {
        configFile: configFile,
        browsers: ['Chrome_travis_ci'],
        singleRun: true,
        autoWatch: false,
        logLevel: "INFO",
        customLaunchers: {
            Chrome_travis_ci: {
                base: 'Chrome',
                flags: ['--no-sandbox']
            }
        }
    };

gulp.task("test", ["ts"], function (done) {
    gutil.log(gutil.colors.green("Testing on " + (travis ? "TRAVIS" : "DEV")));
    if (!travis) {
        // env === DEV --> watch tests
        gulp.watch("app.ts", ["ts"]);
        gulp.watch("src/app/**/*.ts", ["ts"]);
    }

    setupAndStartKarmaWithConfig(travis ? travisConfig : devConfig, done);
});

function setupAndStartKarmaWithConfig(config, callback) {
    new karma(config, function () {
        callback();
    }).on("error", errorHandler).start();
}

function errorHandler(error) {
    gutil.log(error);
    process.exit(1);
}

var mochaRun = function () {
    return gulp.src("src/app/server/tests/**/*.js", { read: false })
        .pipe(mocha({ timeout: 10000, reporter: "list" }))
        .on("error", gutil.log);
};

gulp.task("mocha", function () {
    return mochaRun();
});

gulp.task("test:mocha", ["ts"], function (done) {
    gutil.log(gutil.colors.green("Testing on " + (travis ? "TRAVIS" : "DEV")));
    if (!travis) {
        // env === DEV --> watch tests
        gulp.watch("src/app/server/**/*.ts", function () {
            sequence("ts", "mocha");
        });
    }

    mochaRun();
});

