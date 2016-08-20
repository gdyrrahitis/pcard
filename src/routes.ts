export module Routes {
    export function RouteConfig(app: any) {
        "use strict";

        app.config(($routeProvider, $locationProvider) => {
            $locationProvider.html5Mode(true);

            $routeProvider.when("/", {
                templateUrl: "home.controller/home.controller.html",
                controller: "home.controller"
            })
            .when("/room/:id", {
                templateUrl: "room.controller/room.controller.html",
                controller: "room.controller"
            })
            .otherwise({
                redirectTo: "/"
            });
        });
    }
}