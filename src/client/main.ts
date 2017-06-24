import * as angular from "angular";
import * as toast from "toastr";
import * as io from "socket.io-client";

import { HomeComponent, MenuComponent, ModalComponent, RoomComponent } from "./components/index";
import { SocketService, ModalService, NotificationService, HttpService } from "./services/index";
import { registerRoutes } from "./routes";
import { Runner } from "./runner";

export module pcard {
    let config: ClientAppConfig.ClientConfiguration = require("./client.config.json");

    let socket = io.connect(config.client.baseUrl);
    let app = angular.module("app", [
        require("angular-ui-bootstrap"),
        require("angular-sanitize"),
        require("ngstorage")
    ]);
    // .constant("$toastr", toast)
    // .value("cards", config.poker.mountainGoat)
    // .value("client", config.client)
    // .value("socket", socket)
    // .service("socketService", SocketService)
    // .service("modalService", ModalService)
    // .service("notificationService", NotificationService)
    // .service("httpService", HttpService)
    // .component("home", HomeComponent)
    // .component("room", RoomComponent)
    // .component("menu", MenuComponent)
    // .component("modal", ModalComponent);

    registerRoutes(app, config);
    app.run(Runner);

    export var application = app;
}