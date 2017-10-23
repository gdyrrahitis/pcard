const merge = require('webpack-merge');
const common = require('./webpack.common.js');

module.exports = merge(common, {
    entry: "./src/app/client/app.module.ts",
    plugins: [
        new webpack.DefinePlugin({
            "process.env": {
                "BUILD_TARGET": JSON.stringify("production")
            }
        })
    ]
});