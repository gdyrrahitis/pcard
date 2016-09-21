export function registerRoutes(app: ng.IModule, routes: Predicate<ClientAppConfig.Route>[], defaultRoute?: string) {
    "use strict";
    var config: ClientAppConfig.ClientConfiguration = require("../client.config.json!json");

    app.config(($routeProvider: ng.route.IRouteProvider, $locationProvider: ng.ILocationProvider) => {
        $locationProvider.html5Mode(config.client.html5Mode);

        routes.forEach(v => {
            var route = config.client.routes.find(v);
            $routeProvider.when(route.path, {
                templateUrl: route.templateUrl,
                controller: route.controller
            });
        });

        $routeProvider.otherwise({
            redirectTo: defaultRoute || config.client.basePath
        });
    });
}