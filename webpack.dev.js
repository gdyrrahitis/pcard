const path = require("path");
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const webpack = require("webpack");
const htmlWebpackPlugin = require("html-webpack-plugin");
const reloadPlugin = require("reload-html-webpack-plugin");

module.exports = merge(common, {
    entry: [
        "webpack-dev-server/client?http://localhost:8000",
        'webpack/hot/only-dev-server',
        "./src/app/client/app.module.ts"
    ],
    output: {
        filename: "[name].bundle.js",
        path: path.resolve(__dirname, "dist"),
        publicPath: 'http://localhost:8000/',
        hotUpdateChunkFilename: 'dist/hot/hot-update.js',
        hotUpdateMainFilename: 'dist/hot/hot-update.json'
    },
    plugins: [
        new webpack.DefinePlugin({
            "process.env": {
                "BUILD_TARGET": JSON.stringify("development")
            }
        }),
        new webpack.HotModuleReplacementPlugin(),
        new reloadPlugin(),
        new htmlWebpackPlugin({
            template: './index.html'
        })
    ],
    target: "web",
    devServer: {
        host: "localhost",
        port: 8000,
        historyApiFallback: true,
        hot: true,
        noInfo: true,
        inline: true
    },
    devtool: "cheap-module-eval-source-map"
});