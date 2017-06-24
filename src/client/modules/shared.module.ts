import * as angular from "angular";
import * as toast from "toastr";
import "ngstorage";

import { HttpService, NotificationService, SocketService } from "../services/index";
import { MenuComponent, FooterComponent, HeaderComponent } from "../components/index";
import { socket } from "../socket";
const config: ClientAppConfig.ClientConfiguration = require("../client.config.json");

export const SharedModule: string = angular
    .module("pcard.shared", [
        "ngStorage"
    ])
    .constant("$toastr", toast)
    .constant("config", config.client)
    .value("socket", socket)
    .service("httpService", HttpService)
    .service("notificationService", NotificationService)
    .service("socketService", SocketService)
    .component("pcard-menu", MenuComponent)
    .component("pcard-footer", FooterComponent)
    .component("pcard-header", HeaderComponent)
    .name;