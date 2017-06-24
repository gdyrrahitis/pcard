export function registerRoutes(app: ng.IModule, config: ClientAppConfig.ClientConfiguration) {
    const base: string = "";
    
    app.config(["$routeProvider", "$locationProvider", ($routeProvider: ng.route.IRouteProvider, $locationProvider: ng.ILocationProvider) => {
        $locationProvider.html5Mode(config.client.html5Mode);

        config.client.routes.forEach(route => {
            $routeProvider.when(route.path, {
                template: route.template
            });
        });

        $routeProvider.otherwise({
            redirectTo: config.client.basePath || base
        });
    }]);
}