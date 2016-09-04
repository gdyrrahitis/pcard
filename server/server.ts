var config: AppConfig.Configuration = require("../app.config.json");

import * as app from "../app";

import http = require("http");
import { Socket } from "./socket.io/socket.configuration";
import socketIo = require("socket.io");

let server = http.createServer(<any>app);
let port: number = 54879;

let io = socketIo(server);
let socket = new Socket(io);
socket.connect();

server.listen(port, () => {
    console.log("Server is up and running, listening on port: " + port);
});
