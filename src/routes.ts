import { Bnc } from "./main";
var app = Bnc.Application;

app.config(($routeProvider) => {
    $routeProvider.when("/", {
        templateUrl: "home.controller/home.controller.html",
        controller: "home.controller/home.controller.js"
    })
    .when("/room/:id", {
        templateUrl: "room.controller/room.controller.html",
        controller: "room.controller/room.controller.js"
    })
    .otherwise({
        redirectTo: "/"
    });
});