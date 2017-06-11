import * as socketIo from "socket.io";
import * as http from "http";
import * as path from "path";
import * as express from "express";
import * as bodyParser from "body-parser";
import { Socket } from "./src/server/socket.io/socket";
import { routes } from "./src/server/routes/room.routes";

let config: ServerAppConfig.ServerConfiguration = require("./src/server/server.config.json");
let port: number = process.env.PORT || 8000;
let env: string = process.env.NODE_ENV || "development";
let app: express.Application = express();

app.use(bodyParser.json());
app.use("/rooms", routes.rooms.route);
app.use(express.static("src"));
app.use(express.static("node_modules"));
app.use("/dist", express.static(path.join(__dirname, "/dist")));
app.use(express.static(__dirname));

// just send the index.html for other files to support HTML5Mode
app.all("/*", (req, res, next) => res.sendFile(config.staticResources.entry, { root: __dirname }));

let server = http.createServer(<any>app);
new Socket(socketIo(server)).connect();
server.listen(port);