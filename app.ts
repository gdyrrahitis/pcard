import * as socketIo from "socket.io";
import * as http from "http";
import * as path from "path";
import * as express from "express";
import * as bodyParser from "body-parser";
import { Socket } from "./src/server/socket.io/socket";
import { routes } from "./src/server/routes/room.routes";

const config: ServerAppConfig.ServerConfiguration = require("./src/server/server.config.json");
const port: number = process.env.PORT || 8000;
const env: string = process.env.NODE_ENV || "development";
const app: express.Application = express();

app.use(bodyParser.json());
app.use("/rooms", routes.rooms.route);
app.use(express.static("src"));
app.use(express.static("node_modules"));
app.use("/dist", express.static(path.join(__dirname, "/dist")));
app.use(express.static(__dirname));

// just send the index.html for other files to support HTML5Mode
app.all("/*", (req, res, next) => res.sendFile(config.staticResources.entry, { root: __dirname }));

const server = http.createServer(<any>app);
const io = socketIo(server);
const socketServer = new Socket(io);
socketServer.connect();
server.listen(port);