var gulp = require("gulp"),
    express = require("gulp-express"),
    sequence = require("run-sequence"),
    browserify = require("browserify"),
    tsify = require("tsify"),
    babelify = require("babelify"),
    source = require('vinyl-source-stream'),
    nodemon = require("gulp-nodemon");

// Build
gulp.task("build", function (callback) {
    sequence("clean", ["sass", "bundle", "fonts"], callback);
});

gulp.task("build:w", function (callback) {
    sequence("clean", ["browser:sync", "watch"], callback);
});

gulp.task("bundle", function () {
    browserify("src/main.ts")  // Pass browserify the entry point
        .plugin(tsify, { target: 'es6', module: 'commonjs' }) 
        .transform(babelify, { presets: ["es2015"], extensions: [".js"], sourceMap: 'inline' })
        .bundle()
        .pipe(source("src/main.js"))
        .pipe(gulp.dest("dist/"));
});