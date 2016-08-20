import angular = require("angular");
import "ngSanitize";
import "ngRoute";
import { HomeController } from "./home.controller/home.controller";
import { RoomController } from "./room.controller/room.controller";
import { SocketService } from "./socket.service/socket.service";
import { Routes } from "./routes";

export module Bnc {
    "use strict";

    var app = angular.module("app", ["ngSanitize", "ngRoute"])
        .controller("home.controller", HomeController)
        .controller("room.controller", RoomController)
        .controller("home.controller", HomeController)
        .factory("socket.service", SocketService);

    // Configure routes
    Routes.RouteConfig(app);

    export var Application = app;
}