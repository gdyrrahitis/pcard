import * as angular from "angular";
import "angular-ui-router";

import { SidebarModule } from "./sidebar/sidebar.module";
import { RoomComponent } from "./index";

function route($stateProvider: ng.ui.IStateProvider, $urlRouterProvider: ng.ui.IUrlRouterProvider) {
    $stateProvider.state("room", {
        url: "/room/:id",
        component: "pcardRoom"
    });
    $urlRouterProvider.when("/", "/home");
}
route.$inject = ["$stateProvider", "$urlRouterProvider"];

export const RoomModule = angular.module("pcard.room", ["ui.router", SidebarModule])
    .component("pcardRoom", RoomComponent)
    .config(route)
    .name;