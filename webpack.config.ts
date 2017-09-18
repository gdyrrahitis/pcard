import * as webpack from "webpack";
import * as path from "path";

export const config: webpack.Configuration = {
    entry: "./src/app/client/app.module.ts",
    output: {
        filename: "[name].bundle.js",
        path: path.resolve(__dirname, "dist")
    },
    resolve: {
        extensions: [".ts", ".js"]
    },
    module: {
        rules: [
            { test: /\.html$/, use: "raw-loader" },
            { test: /\.(png|woff|woff2|eot|ttf|svg)$/, use: 'url-loader?limit=100000' },
            { test: /\.css$/, use: ["style-loader", "css-loader"] },
            { test: /\.ts$/, use: ['babel-loader', 'ts-loader'], exclude: /node_modules/ }
        ]
    }
};