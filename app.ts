import http = require("http");
import { registerSocketIo } from "./src/server/setup.socket";
var config: ServerAppConfig.ServerConfiguration = require("./src/server/server.config.json");
import * as express from "express";
import { registerMiddlewares } from "./src/server/express.middlewares";

let port: number = process.env.PORT || 3001;
let env: string = process.env.NODE_ENV || "development";
let middewareActions = [() => express.static(__dirname)];
let app: express.Application = express();

config.staticResources.directories
    .sort((a, b) => a.order - b.order)
    .forEach((v) => middewareActions.push(() => express.static(v.path)));

registerMiddlewares(app, middewareActions);

// just send the index.html for other files to support HTML5Mode
app.all("/*", (req, res, next) => res.sendFile(config.staticResources.entry, { root: __dirname }));

registerSocketIo(http.createServer(<any>app)).listen(port);