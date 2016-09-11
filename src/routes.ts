export function registerRoutes(app: ng.IModule) {
    "use strict";
    var config: ClientAppConfig.ClientConfiguration = require("../app.config.json!json");

    app.config(($routeProvider: ng.route.IRouteProvider, $locationProvider: ng.ILocationProvider) => {
        $locationProvider.html5Mode(config.client.html5Mode);

        var home = config.client.routes.find((v) => v.controller === "homeController");
        var room = config.client.routes.find((v) => v.controller === "roomController");

        $routeProvider
            .when(home.path, {
                templateUrl: home.templateUrl,
                controller: home.controller
            })
            .when(room.path, {
                templateUrl: room.templateUrl,
                controller: room.controller
            })
            .otherwise({
                redirectTo: config.client.basePath
            });
    });
}