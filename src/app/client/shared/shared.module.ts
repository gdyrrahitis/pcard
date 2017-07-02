import * as angular from "angular";
import * as toast from "toastr";
import "ngstorage";

import { HttpService, NotificationService, SocketService, TrustedFilter, socket } from "./index";

export const SharedModule: string = angular
    .module("pcard.shared", [
        "ngStorage"
    ])
    .value("$toastr", toast)
    .value("socket", socket)
    .service("httpService", HttpService)
    .service("notificationService", NotificationService)
    .service("socketService", SocketService)
    .filter("trusted", TrustedFilter)
    .name;