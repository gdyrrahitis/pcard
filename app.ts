import * as express from "express";
import * as path from "path";
import { registerMiddlewares } from "./server/express.middlewares";

let app: express.Application = express();

let middewareActions = [
    () => express.static("src"),
    () => express.static("node_modules"),
    () => express.static("dist"),
    () => express.static(__dirname)
];

registerMiddlewares(app, middewareActions);
app.all('/*', (req, res, next) => {
    // Just send the index.html for other files to support HTML5Mode
    res.sendFile("index.html", { root: __dirname });
});

export = app;