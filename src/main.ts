/// <reference path="../typings/globals/jquery/index.d.ts" />
/// <reference path="../typings/globals/angular/index.d.ts" />
import angular = require("angular");
import { HomeController } from "./home.controller/home.controller";
import { RoomController } from "./room.controller/room.controller";
import { SocketService } from "./socket.service/socket.service";

export module Bnc {
    "use strict";

    var app = angular.module("app", ["ngSanitize", "ngRoute"])
        .controller("home.controller", HomeController)
        .controller("room.controller", RoomController)
        .controller("home.controller", HomeController)
        .factory("socket.service", SocketService);
    export var Application = app;
}