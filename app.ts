import { Socket } from "./src/server/socket.io/socket";
import * as socketIo from "socket.io";
import * as http from "http";
import * as path from "path";
import * as express from "express";

let config: ServerAppConfig.ServerConfiguration = require("./src/server/server.config.json");
let port: number = process.env.PORT || 8000;
let env: string = process.env.NODE_ENV || "development";
let middewareActions = [() => express.static(__dirname)];
let app: express.Application = express();

app.use(express.static(__dirname));
app.use(express.static("src"));
app.use(express.static("node_modules"));
app.use("/dist", express.static(path.join(__dirname, "/dist")));

// just send the index.html for other files to support HTML5Mode
app.all("/*", (req, res, next) => res.sendFile(config.staticResources.entry, { root: __dirname }));

let server = http.createServer(<any>app);
new Socket(socketIo(server)).connect();
server.listen(port);