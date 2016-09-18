var config: ServerAppConfig.ServerConfiguration = require("./server.config.json");
import * as app from "../app";
import http = require("http");
import { registerSocketIo } from "./setup.socket";

let port: number = 54879;
let server = http.createServer(<any>app);

registerSocketIo(server).
    listen(port, () => {
        console.log("Server is up and running, listening on port: " + port);
    });