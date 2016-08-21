import angular = require("angular");
import "ngSanitize";
import "ngRoute";
import "ngStorage";
import { HomeController } from "./home.controller/home.controller";
import { RoomController } from "./room.controller/room.controller";
import { MenuController } from "./menu.controller/menu.controller";
import { SocketService } from "./socket.service/socket.service";
import { Routes } from "./routes";

export module Bnc {
    "use strict";

    var app = angular.module("app", ["ngSanitize", "ngRoute", "ngStorage"])
        .controller("homeController", HomeController)
        .controller("roomController", RoomController)
        .controller("menuController", MenuController)
        .factory("socketService", ["$rootScope", SocketService]);

    // Configure routes
    Routes.RouteConfig(app);

    export var Application = app;
}