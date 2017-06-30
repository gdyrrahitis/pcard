import * as angular from "angular";
import * as toast from "toastr";
import "ngstorage";

import { HttpService, NotificationService, SocketService } from "./index";

export const SharedModule: string = angular
    .module("pcard.shared", [
        "ngStorage"
    ])
    .constant("$toastr", toast)
    .service("httpService", HttpService)
    .service("notificationService", NotificationService)
    .service("socketService", SocketService)
    .name;