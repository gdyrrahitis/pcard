import * as angular from "angular";
import { SharedModule } from "./shared.module";
const base: string = "";

let routerConfig = ($routeProvider: ng.route.IRouteProvider,
    $locationProvider: ng.ILocationProvider,
    config: ClientAppConfig.Client) => {
    $locationProvider.html5Mode(config.html5Mode);

    config.routes.forEach(route => {
        $routeProvider.when(route.path, {
            template: route.template
        });
    });

    $routeProvider.otherwise({
        redirectTo: config.basePath || base
    });
}
routerConfig.$inject = ["$routeProvider", "$locationProvider", "config"];

export const RouterModule = angular
    .module("pcard.router", [
        SharedModule,
        require("angular-route")
    ])
    .config(routerConfig)
    .name;