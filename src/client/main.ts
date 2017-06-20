import * as ng from "angular";
import * as toast from "toastr";
import * as io from "socket.io-client";
import "angular-sanitize";
import "angular-route";
import "ngstorage";
import "angular-ui-bootstrap";
import { HomeController, RoomController, MenuController, JoinRoomModalController } from "./controllers/index";
import { SocketService, ModalService, NotificationService, HttpService } from "./services/index";
import { PluralFilter } from "./filters/index";
import { registerRoutes } from "./routes";

export module pcard {
    let config: ClientAppConfig.ClientConfiguration = require("./client.config.json");

    let socket = io.connect(config.client.baseUrl);
    let app = ng.module("app", ["ui.bootstrap", "ngSanitize", "ngRoute", "ngStorage"])
        .value("socket", socket)
        .constant("cards", config.poker.mountainGoat)
        .constant("$toastr", toast)
        .service("socketService", ["$rootScope", "socket", SocketService])
        .service("modalService", ["$uibModal", ModalService])
        .service("notificationService", ["$toastr", NotificationService])
        .service("httpService", ["$http", HttpService])
        .filter("plural", PluralFilter)
        .component("home", {
            controller: HomeController,
            templateUrl: "src/client/controllers/home.controller/home.controller.html"
        })
        .component("room", {
            controller: RoomController,
            templateUrl: "src/client/controllers/room.controller/room.controller.html"
        })
        .component("menu", {
            controller: MenuController,
            templateUrl: "src/client/controllers/menu.controller/menu.controller.html"
        })
        .component("join", {
            bindings: {
                $uibModalInstance: "<"
            },
            controller: JoinRoomModalController,
            templateUrl: "src/client/controllers/join.room.modal.controller/join.room.modal.controller.html"
        });

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