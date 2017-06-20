export function registerRoutes(app: ng.IModule, config: ClientAppConfig.ClientConfiguration) {

    app.config(["$routeProvider", "$locationProvider", ($routeProvider: ng.route.IRouteProvider, $locationProvider: ng.ILocationProvider) => {
        let routes = [(v) => v.controller === "homeController", (v) => v.controller === "roomController"];

        $locationProvider.html5Mode(config.client.html5Mode);

        routes.forEach(v => {
            var route = config.client.routes.find(v);
            $routeProvider.when("/", {
                template: "<home></home>"
            })
            .when("/room/:id", {
                template: "<room></room>"
            });
        });

        $routeProvider.otherwise({
            redirectTo: config.client.basePath || config.client.basePath
        });
    }]);
}