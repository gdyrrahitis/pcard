import * as ng from "angular";
import * as toast from "toastr";
import * as io from "socket.io-client";
import "angular-sanitize";
import "angular-route";
import "ngstorage";
import "angular-ui-bootstrap";
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
        .controller("homeController", ["$scope", "$location", "$localStorage", "socketService", "notificationService", HomeController])
        .controller("roomController", ["$scope", "$rootScope", "$location", "$routeParams", "$localStorage", "socketService", "configuration", RoomController])
        .controller("menuController", ["$scope", "$location", "$localStorage", "socketService", MenuController])
        .service("socketService", ["$rootScope", "socket", SocketService])
        .service("modalService", ["$uibModal", ModalService])
        .service("notificationService", ["$toastr", NotificationService]);

    registerRoutes(app, config);

    app.run(["$rootScope", "$location", "socketService", "notificationService",
        ($rootScope: ng.IScope, $location: ng.ILocationService,
            socketService: SocketService,
            notificationService: NotificationService) => {

            socketService.on("user-banned", () => {
                $rootScope.$broadcast("user-ban-start");
                $location.path("/");

                notificationService
                    .info(`User is banned from room by the moderator`,
                    "Ban", { progressBar: true });
            });

            socketService.on("user-disconnected", (roomId: string) => {
                if (roomId) {
                    notificationService
                        .warning(`User disconnected from room: ${roomId}`,
                        "Disconnect", { progressBar: true });
                } else {
                    notificationService
                        .error(`Room id is not defined, unexpected error occured`,
                        "Error", { progressBar: true });
                }
            });
        }
    ]);

    export var application = app;
}