var gulp = require("gulp"),
    gutil = require("gulp-util"),
    bundle = require("./tasks.bundle").bundle,
    main = require("./variables.js").main,
    webpack = require('webpack'),
    WebpackDevServer = require('webpack-dev-server'),
    webpackConfig = require('../../webpack.config.js');

gulp.task("watch", ["webpack-dev-server"], function () {
    gulp.watch("src/app/client/**/*", ["ts","bundle"]);
});

gulp.task("webpack-dev-server", function (callback) {
    // modify some webpack config options
    var myConfig = Object.create(webpackConfig);

    // Start a webpack-dev-server
    new WebpackDevServer(webpack(myConfig), {
        publicPath: myConfig.output.publicPath,
        stats: {
            colors: true
        }
    }).listen(8000, "localhost", function (err) {
        if (err) throw new gutil.PluginError("webpack-dev-server", err);
        gutil.log("[webpack-dev-server]", "http://localhost:8000/webpack-dev-server/index.html");
    });
});