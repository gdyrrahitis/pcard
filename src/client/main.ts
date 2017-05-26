import * as ng from "angular";
import "angular-sanitize";
import "angular-route";
import "ngStorage";
import { HomeController } from "./controllers/home.controller/home.controller";
import { RoomController } from "./controllers/room.controller/room.controller";
import { MenuController } from "./controllers/menu.controller/menu.controller";
import { SocketService } from "./services/socket.service/socket.service";
import { registerRoutes } from "./routes";
import * as io from "socket.io-client";

export module pcard {
    let config: ClientAppConfig.ClientConfiguration = require("./client.config.json");

    let socket = io.connect(config.client.baseUrl);
    let app = ng.module("app", ["ngSanitize", "ngRoute", "ngStorage"])
        .value("socket", socket)
        .constant("configuration", config)
        .controller("homeController", HomeController)
        .controller("roomController", RoomController)
        .controller("menuController", MenuController)
        .factory("socketService", ["$rootScope", "socket", SocketService]);

    registerRoutes(app, config);

    app.run(["$rootScope", "$location", "socketService",
        ($rootScope: ng.IScope, $location: ng.ILocationService, socketService: SocketService) => {
            socketService.on("user-banned", () => {
                $location.path("/");
            });
        }]);

    export var Application = app;
}