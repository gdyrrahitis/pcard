import * as ng from "angular";
import * as toast from "toastr";
import * as io from "socket.io-client";
import "angular-sanitize";
import "angular-route";
import "ngstorage";
import { HomeController, RoomController, MenuController } from "./controllers/index";
import { SocketService, ModalService, NotificationService } from "./services/index";
import { registerRoutes } from "./routes";

export module pcard {
    let config: ClientAppConfig.ClientConfiguration = require("./client.config.json");

    let socket = io.connect(config.client.baseUrl);
    let app = ng.module("app", ["ui.bootstrap", "ngSanitize", "ngRoute", "ngStorage"])
        .value("socket", socket)
        .constant("configuration", config)
        .constant("$toastr", toast)
        .controller("homeController", HomeController)
        .controller("roomController", RoomController)
        .controller("menuController", MenuController)
        .factory("socketService", ["$rootScope", "socket", SocketService])
        .factory("modalService", ["$uibModal", ModalService])
        .factory("notificationService", ["$toastr", NotificationService]);

    registerRoutes(app, config);

    app.run(["$rootScope", "$location", "socketService",
        ($rootScope: ng.IScope, $location: ng.ILocationService, socketService: SocketService) => 
            socketService.on("user-banned", () => $location.path("/"))
    ]);

    export var Application = app;
}