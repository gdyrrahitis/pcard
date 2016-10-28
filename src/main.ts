import * as ng from "angular";
import "angular-sanitize";
import "angular-route";
import "ngStorage";
import { HomeController } from "./home.controller/home.controller";
import { RoomController } from "./room.controller/room.controller";
import { MenuController } from "./menu.controller/menu.controller";
import { SocketService } from "./socket.service/socket.service";
import { registerRoutes } from "./routes";

export module Bnc {
    "use strict";
    var config: ClientAppConfig.ClientConfiguration = require("./client.config.json");

    var app = ng.module("app", ["ngSanitize", "ngRoute", "ngStorage"])
        .controller("homeController", HomeController)
        .controller("roomController", RoomController)
        .controller("menuController", MenuController)
        .factory("socketService", ["$rootScope", SocketService]);

    // Configure routes
    registerRoutes(app, 
        [(v) => v.controller === "homeController", (v) => v.controller === "roomController"], 
        config.client.basePath);

    app.run(["$rootScope", "$location", "socketService", ($rootScope: ng.IScope, $location: ng.ILocationService, socketService: SocketService) => {
        socketService.on("user-banned", () => {
            $location.path("/");
        });
    }]);

    export var Application = app;
}