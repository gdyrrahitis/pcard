import * as express from "express";
const config: ServerAppConfig.ServerConfiguration = require("../server.config.json");

export module routes.rooms {
    let rooms = express.Router();
    rooms.get("/", (request, response) => {
        response.status(200).json({ limit: config.socketio.maxRoomsAllowed });
    });
    export var route = rooms;
}