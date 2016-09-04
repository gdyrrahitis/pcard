var config: AppConfig.Configuration = require("../app.config.json!json");
export module Routes {
    export function RouteConfig(app: any) {
        "use strict";

        app.config(($routeProvider, $locationProvider) => {
            $locationProvider.html5Mode(config.client.html5Mode);
            
            var home = config.client.routes.find((v) => v.controller === "homeController");
            var room = config.client.routes.find((v) => v.controller === "roomController");

            $routeProvider.when(home.path, {
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
}