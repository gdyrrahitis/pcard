var config: ServerAppConfig.ServerConfiguration = require("./server/server.config.json");

import * as express from "express";
import * as path from "path";
import { registerMiddlewares } from "./server/express.middlewares";

let app: express.Application = express();

let middewareActions = [
    () => express.static(__dirname)
];

config.staticResources.directories
    .sort((a, b) => {
        return a.order - b.order;
    })
    .forEach((v) => {
        middewareActions.push(() => express.static(v.path));
    });

registerMiddlewares(app, middewareActions);
app.all('/*', (req, res, next) => {
    // Just send the index.html for other files to support HTML5Mode
    res.sendFile(config.staticResources.entry, { root: __dirname });
});

export = app;